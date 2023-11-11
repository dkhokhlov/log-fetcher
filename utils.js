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

/**
 * Find all lines in Buffer. Backward means buffers are read from file in backward direction - next buffer
 * will be on left side.
 * Using eol = 10 (\n), included with each line
 * @param buffer - current input buffer
 * @param partial_right - partial line from previous buffer on the right side of the input buffer
 * @returns {Array<Array>} - array with 2 elements:
 *   - partial line on the left side of the buffer (slice)
 *   - array of complete lines (slices)
 */
function backwardLineSegmentation(buffer, partial_right) {
    const positions = []; // eol
    let eol = 10;
    let pos = buffer.indexOf(eol);
    while (pos !== -1) {
        positions.push(pos);
        pos = buffer.indexOf(eol, pos + 1);
    }
    let left;
    if (positions.length === 0) {
        left = buffer.join(right);
        return [left, []]; // one incomplete line on the left side of the buffer, will be partial_right for next buffer
    }
    let lines = [];
    let last_pos = positions.pop(); // last
    if (last_pos === buffer.size - 1)
        lines.push(right); // right becomes complete line
    if (positions.length === 0) {
        left = buffer.slice(0, last_pos + 1);
        return [left, []]; // one incomplete line on the left side of the buffer, will be partial_right for next buffer
    }
    while (positions.length - 1 > 0) {
        pos = positions.pop();
        line = buffer.slice(pos + 1, last_pos + 1);
        lines.push(line); // needs to be reversed at the end
        last_pos = pos;
    }
    left = buffer.slice(0, positions[0])
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
    findAllBytePositions,
//    sleep,
//    escapeRegexp
};
