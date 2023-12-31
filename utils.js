'use strict'
const fs = require('fs');

/**
 * Check if encoding type string is valid encoding.
 * @param {string} encoding
 * @returns {boolean}
 */
function isValidEncoding(encoding) {
    if (typeof encoding !== 'string') {
        return false; // Early return for non-string types
    }
    try {
        // Buffer.from() accepts encoding as the second parameter.
        // If the encoding is invalid, an exception will be thrown.
        Buffer.from('test', encoding);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a directory exists and is readable. Throws if not.
 * @param dir_path
 * @returns {Promise<void>}
 */
async function checkDirectory(dir_path) {
    try {
        await fs.promises.access(dir_path, fs.constants.F_OK | fs.constants.R_OK);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`The directory at ${dir_path} does not exist.`);
        } else if (error.code === 'EACCES') {
            throw new Error(`The directory at ${dir_path} is not readable.`);
        } else {
            throw new Error(`Error checking directory at ${dir_path}: ${error.message}`);
        }
    }
}

function assert(condition, value, message) {
    if (!condition) {
        throw new Error(`${message}, received: ${value}`);
    }
}

class SeedableRandom {
    constructor(seed) {
        this.seed = seed;
    }

    random() {
        // simple LCG
        const a = 1664525;
        const c = 1013904223;
        const m = 2 ** 32;
        // update the seed and return a pseudo-random number
        this.seed = (a * this.seed + c) % m;
        return this.seed / m;
    }
}

const NEWLINE = 10; // ASCII code for '\n'
/**
 * Find all lines in Buffer. Backward means buffers are read from file in backward direction - next buffer
 * will be on left side. Each line ends with LF = 10 (\n). Lines are returned in order as they appear in the buffer.
 * File example: File(|--bufferN--|--buffer...--|--buffer2--|--buffer1--|)
 * @param buffer - current input buffer
 * @param partial_right - partial line from previous buffer on the right side of the input buffer
 * @returns {Array<Array>} - array with 2 elements:
 *   - partial line on the left side of the buffer (slice)
 *   - array of complete lines (slices)
 */
function backwardLineSegmentation(buffer, partial_right) {
    const positions = []; // LF positions in buffer
    let pos = buffer.indexOf(NEWLINE);
    while (pos !== -1) {
        positions.push(pos);
        pos = buffer.indexOf(NEWLINE, pos + 1);
    }
    let left;
    if (positions.length === 0) {
        left = Buffer.concat([buffer, partial_right]);
        return [left, []]; // incomplete line on the left side of the buffer, will be partial_right for next buffer
    }
    let lines = [];
    let last_pos = positions.pop(); // end of last line in buffer
    if (partial_right.length > 0) {
        const line = Buffer.concat([buffer.slice(last_pos + 1), partial_right]); // partial_right becomes complete line
        lines.push(line);
    }
    if (positions.length === 0) {
        left = buffer.slice(0, last_pos + 1); // include LF
        return [left, lines]; // incomplete line on the left side of the buffer, will be partial_right for next buffer
    }
    let line;
    while (positions.length > 0) {
        pos = positions.pop(); // position on the right
        line = buffer.slice(pos + 1, last_pos + 1);
        lines.push(line); // needs to be reversed at the end
        last_pos = pos;
    }
    left = buffer.slice(0, last_pos + 1)
    return [left, lines.reverse()];  // lines order as in input buffer
}

/**
 * Escapes regex special characters in a string.
 * @param {string} str - The input string.
 * @return {string} The escaped RegExp object.
 */
// function escapeRegexp(str) {
//     // Escaping special characters using replace function
//     const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//     return escaped;
// }

/**
 * async sleep
 * @param ms
 * @returns {Promise<unknown>}
 */
// async function sleep(ms) {
//     return await new Promise(resolve => setTimeout(resolve, ms));
// }

module.exports = {
    isValidEncoding,
    checkDirectory,
    assert,
    NEWLINE,
    backwardLineSegmentation,
    SeedableRandom,
//    sleep,
//    escapeRegexp
};
