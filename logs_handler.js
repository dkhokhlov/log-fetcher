'use strict'

const fs = require('fs');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Top level /logs endpoint handler.
 *
 * @param logdir
 * @param filename_regex
 * @param num_lines
 * @param keyword
 * @param async_reply_send
 * @returns {Promise<void>}
 */
async function logs_handler(logdir, filename_regex, num_lines, keyword, async_reply_send) {

    await async_reply_send("OK @@@@@@@");

}

module.exports = {
    logs_handler,
};

