const crypto = require('crypto');

module.exports = (buffer, options = {}) => {
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
        options = {};
    }

    const {
        algorithm = 'md5',
        truncate = 0,
    } = options;

    if (typeof algorithm !== 'string' || algorithm.length === 0) {
        throw new TypeError('getFileHash: algorithm must be a non-empty string');
    }
    if (typeof truncate !== 'number' || !Number.isFinite(truncate)) {
        throw new TypeError('getFileHash: truncate must be a finite number');
    }
    if (buffer === undefined || buffer === null) {
        throw new TypeError('getFileHash: buffer is required');
    }

    const hash = crypto.createHash(algorithm).update(buffer).digest('hex');

    if (truncate > 0 && truncate < hash.length) {
        return hash.substring(0, truncate);
    }
    return hash;
};
