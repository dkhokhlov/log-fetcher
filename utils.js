const fs = require('fs');

/**
 * Escapes regex special characters in a string.
 * @param {string} str - The input string.
 * @return {string} The escaped RegExp object.
 */
function escapeRegexp(str) {
    // Escaping special characters using replace function
    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped;
}

/**
 * Check if encoding type string is valid encoding.
 * @param {string} encoding
 * @returns {boolean}
 */
function isValidEncoding(encoding) {
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
        await fs.promises.stat(dir_path, fs.constants.F_OK | fs.constants.R_OK);
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

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}


function assert(condition, value, message) {
    if (!condition) {
        throw new Error(`${message}, received: ${value}`);
    }
}



module.exports = {
    escapeRegexp,
    isValidEncoding,
    checkDirectory,
    sleep,
    assert
};
