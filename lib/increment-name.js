const sanitize = require('sanitize-filename');

module.exports = (name) => {
    if (!name || typeof name !== 'string') {
        throw new TypeError('incrementName: name must be a non-empty string');
    }
    if (name.includes('\0')) {
        throw new Error('incrementName: name contains null byte');
    }

    const lastDot = name.lastIndexOf('.');
    const hasExt = lastDot > 0 && lastDot < name.length - 1;
    const extension = hasExt ? name.slice(lastDot + 1) : '';
    const baseRaw = hasExt ? name.slice(0, lastDot) : name;

    const baseFilename = sanitize(baseRaw) || 'file';

    const regex = /^(.*)-(\d+)$/;
    const found = baseFilename.match(regex);

    let incrementedName;
    if (found === null) {
        incrementedName = `${baseFilename}-1`;
    } else {
        const matchedName = found[1];
        const matchedNumber = Number(found[2]);
        if (!Number.isSafeInteger(matchedNumber) || matchedNumber >= Number.MAX_SAFE_INTEGER) {
            incrementedName = `${matchedName}-1`;
        } else {
            incrementedName = `${matchedName}-${matchedNumber + 1}`;
        }
    }

    return hasExt ? `${incrementedName}.${extension}` : incrementedName;
};
