'use strict'
const fs = require('fs');
const {assert, backwardLineSegmentation} = require('./utils')

const {logger: root_logger} = require('./logger')
const logger = root_logger.child({id: 'logs_handler'});


/**
 * Retrieve log lines from given file and pass them to async lambda. Order of outputted log lines - latest log lines
 * first. If keyword is defined then only lines that have that keyword are returned. Lines are sent w/o decoding/encoding.
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
async function logs_handler(file_path, file_encoding, chunk_size,
                            num_lines, keyword, async_output) {
    const file_stat = await fs.promises.stat(file_path);
    assert(file_stat.isFile(), `The path must be a file: ${file_path}`);

    const fd = await fs.promises.open(file_path, 'r');
    let position = file_stat.size;
    let line_count = 0;
    try {
        let partial_line = Buffer.alloc(0);  // empty buffer (w/o eol) means next buffer partial slice on the right will be ignored
        while (position > 0 && (num_lines === undefined || line_count < num_lines)) {
            const read_chunk_size = Math.min(chunk_size, position);
            const chunk_buffer = Buffer.alloc(read_chunk_size);
            position -= read_chunk_size;
            const {bytesRead} = await fd.read(chunk_buffer, 0, read_chunk_size, position);
            let lines;
            [partial_line, lines] = backwardLineSegmentation(chunk_buffer, partial_line);
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                if (!keyword || line.toString(file_encoding).includes(keyword)) {
                    await async_output(line);
                    line_count++;
                    if (num_lines !== undefined && line_count >= num_lines) {
                        break;
                    }
                }
            }
        }
    } catch (error) {
        logger.error(`An error occurred while reading the file ${file_path}: ${error.message}`);
        throw error;
    } finally {
        await fd.close();
    }
}

module.exports = {
    logs_handler,
};

