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
    assert(file_stat.isFile(), file_path, 'The path must be a file');

    const fd = await fs.promises.open(file_path, 'r');
    let position = (await fd.stat()).size;
    let buffer = Buffer.alloc(0);
    let line_count = 0;
    const NEWLINE = 10; // ASCII code for '\n'

    try {
        while (position > 0 && (num_lines === undefined || line_count < num_lines)) {
            const new_chunk_size = Math.min(chunk_size, position);
            const chunk_buffer = Buffer.alloc(new_chunk_size);
            position -= new_chunk_size;
            // read chunk as bytes
            await fd.read(chunk_buffer, 0, new_chunk_size, position);
            buffer = Buffer.concat([chunk_buffer, buffer]);
            let last_line_end = 0;
            for (let i = 0; i < buffer.length; i++) {
                // check for newline byte
                if (buffer[i] === NEWLINE) {
                    let line = buffer.slice(last_line_end, i);
                    last_line_end = i + 1; // update the start of the next line after the newline byte
                    if (keyword)
                    {
                        let line_str = line.toString(file_encoding);
                        if (!line_str.includes(keyword)) continue;
                    }
                    await async_output(line); // output the line as Buffer
                    line_count++;
                    if (num_lines !== undefined && line_count >= num_lines) {
                        break;
                    }
                }
            }
            // keep only the incomplete line at the end for the next iteration
            buffer = buffer.slice(last_line_end);
        }
    } finally {
        if (fd) await fd.close();
    }
}

module.exports = {
    logs_handler,
};

