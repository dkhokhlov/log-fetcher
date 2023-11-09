'use strict'

const fs = require('fs');
const path = require('path');

const {logger: root_logger} = require('./logger')
const logger = root_logger.child({ id: 'logs_handler' });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retrieve log lines for given file and pass them to async lambda.
 * Throws Exceptions on errors.
 *
 * @param  {string} log_dir
 * @param {RegExp} filename_regexp
 * @param {integer} num_lines
 * @param {string} keyword
 * @param {Function} async_reply_send
 * @returns {Promise<void>}
 */
async function logs_handler(log_dir, filename_regexp, num_lines, keyword, async_reply_send) {


    await async_reply_send("OK @@@@@@@");

    throw new Error('This is an error message');


}




module.exports = {
    logs_handler,
};

