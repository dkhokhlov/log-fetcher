'use strict'

const fs = require('fs');
const path = require('path');
const {assert} = require('./utils')

const {logger: root_logger} = require('./logger')
const logger = root_logger.child({id: 'logs_handler'});


/**
 * Retrieve log lines for given file and pass them to async lambda. Order of outputted log lines: latest log lines
 * listed first. If keyword is defined then only matching lines are returned. Lines are sent as-is w/o decoding/encoding.
 * Note: the client is responsible for correct handling of premature end of chunk stream to detect error condition when
 * server side error happened after sending of lines started.
 * Throws Exceptions on errors.
 *
 * @param {string} file_path - log file path
 * @param {string} file_encoding - log file encoding type as string
 * @param {number} chunk_size - size of chunks used to read log file
 * @param {number} num_lines - number of lines to retrieve. if undefined then output all log lines.
 * @param {string} keyword - filter lines that contain keyword
 * @param {Function} async_output - async lambda to output line(s)
 * @returns {Promise<void>}
 */
async function logs_handler(file_path, file_encoding, chunk_size, num_lines, keyword, async_output) {
    const file_stat = await fs.promises.stat(file_path);
    assert(file_stat.isFile(), `The path must be a file: ${file_path}`);

    const fd = await fs.promises.open(file_path, 'r');
    let position = file_stat.size;
    let buffer = Buffer.alloc(0);
    let line_count = 0;
    const NEWLINE = 10; // ASCII code for '\n'

    try {
        while (position > 0 && (num_lines === undefined || line_count < num_lines)) {
            const read_chunk_size = Math.min(chunk_size, position);
            const chunk_buffer = Buffer.alloc(read_chunk_size);
            position -= read_chunk_size;
            // Use fs.promises.read with the FileHandle object
            const {bytesRead} = await fd.read(chunk_buffer, 0, read_chunk_size, position);
            buffer = Buffer.concat([chunk_buffer.slice(0, bytesRead), buffer]);
            // search for line ends
            let new_line_index = buffer.indexOf(NEWLINE); // Search for newline
            while (new_line_index !== -1) {
                const line = buffer.slice(0, new_line_index);
                buffer = buffer.slice(new_line_index + 1); // +1 to remove the newline character
                if (!keyword || line.toString(file_encoding).includes(keyword)) {
                    await async_output(line); // output the line as Buffer
                    line_count++;
                    if (num_lines !== undefined && line_count >= num_lines) {
                        break;
                    }
                }
                new_line_index = buffer.indexOf(NEWLINE); // Search for the next newline
            }
        }
    } catch (error) {
        logger.error(`An error occurred while reading the file: ${error.message}`);
        throw error;
    } finally {
        await fd.close();
    }
}

module.exports = {
    logs_handler,
};

