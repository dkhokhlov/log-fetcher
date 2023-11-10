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
 * Find all positions of byte in buffer. Return found positions as array.
 * @param buffer
 * @param byte_value
 * @returns {*[]}
 */
function findAllBytePositions(buffer, byte_value) {
  const positions = [];
  let pos = buffer.indexOf(byte_value);
  while (pos !== -1) {
    positions.push(pos);
    pos = buffer.indexOf(byte_value, pos + 1);
  }
  return positions;
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
