const path = require('path');
const getFileHash = require('./get-file-hash');

module.exports = (filename, data, options = {}) => {
    if (!filename || typeof filename !== 'string') {
        throw new TypeError('getHashedFilename: filename must be a non-empty string');
    }
    if (filename.includes('\0')) {
        throw new Error('getHashedFilename: filename contains null byte');
    }

    let hash;
    if (Buffer.isBuffer(data)) {
        hash = getFileHash(data, options);
    } else if (typeof data === 'string') {
        hash = data;
    } else {
        throw new TypeError(
            `getHashedFilename: data must be a Buffer or hash string, got ${data === null ? 'null' : typeof data}`,
        );
    }

    if (!hash) {
        throw new Error('getHashedFilename: empty hash');
    }
    if (hash.includes('\0')) {
        throw new Error('getHashedFilename: hash contains null byte');
    }

    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    if (!basename || basename === '.' || basename === '..') {
        throw new Error(`getHashedFilename: invalid basename "${basename}"`);
    }

    return `${basename}.${hash}${ext}`;
};
