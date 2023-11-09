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
 * @param {string} log_dir - log dir
 * @param {string} file_name - log file name
 * @param {number} chunk_size - size of chunks used to read log file
 * @param {number} num_lines - number of lines to retrieve. if undefined then output all log lines.
 * @param {string} keyword - filter lines that contain keyword
 * @param {Function} async_output - async lambda to output line(s)
 * @returns {Promise<void>}
 */
async function logs_handler(log_dir, file_name, chunk_size, num_lines, keyword, async_output) {

    const full_path = path.join(log_dir, file_name);
    const file_stat = await fs.promises.stat(full_path);
    assert(file_stat.isFile(), full_path, 'The path must be a file');

    const fd = await fs.promises.open(full_path, 'r');
    let position = (await fd.stat()).size;
    let buffer = Buffer.alloc(0);
    let line_count = 0;
    const NEWLINE = 10; // ASCII code for '\n'

    try {
        while (position > 0 && (num_lines === undefined || line_count < num_lines)) {
            const chunk_size = Math.min(1024, position);
            const chunk_buffer = Buffer.alloc(chunk_size);
            position -= chunk_size;

            await fd.read(chunk_buffer, 0, chunk_size, position);
            buffer = Buffer.concat([chunk_buffer, buffer]);

            let last_line_end = 0;
            for (let i = 0; i < buffer.length; i++) {
                // Check if we found a newline byte
                if (buffer[i] === NEWLINE) {
                    let line = buffer.slice(last_line_end, i);
                    last_line_end = i + 1; // Update the start of the next line after the newline byte
                    if (keyword === undefined || line.includes(keyword)) {
                        await async_reply_send(line); // Send the line as a Buffer
                        line_count++;
                        if (num_lines !== undefined && line_count >= num_lines) {
                            break;
                        }
                    }
                }
            }
            // keep only the incomplete line at the end for the next iteration
            buffer = buffer.slice(last_line_end);
        }
    } finally {
        await fd.close();
    }
}

module.exports = {
    logs_handler,
};

