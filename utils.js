const fs = require('fs');
const {logger} = require('./logger')

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
 * Checks if a directory exists and is readable.
 * @param dir_path
 * @returns {boolean} directory ok/no-ok
 */
async function checkDirectory(dir_path) {
    try {
        await fs.promises.stat(dir_path, fs.constants.F_OK | fs.constants.R_OK);
        return true; // the directory is OK
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.error(`The directory at ${dir_path} does not exist.`);
        } else if (error.code === 'EACCES') {
            logger.error(`The directory at ${dir_path} is not readable.`);
        } else {
            logger.error(`Error checking directory at ${dir_path}: ${error.message}`);
        }
        return false; // the directory is not OK
    }
}

module.exports = {
    escapeRegexp,
    checkDirectory
};
