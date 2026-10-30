const path = require('path');

const replaceStem = (filename, oldStem, newStem) => {
    if (!filename || !oldStem) return filename;

    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const dir = path.dirname(filename);

    let newBase;
    if (base === oldStem) {
        newBase = newStem;
    } else if (base.endsWith(`-${oldStem}`)) {
        newBase = base.slice(0, base.length - oldStem.length) + newStem;
    } else if (base.startsWith(`${oldStem}-`)) {
        newBase = newStem + base.slice(oldStem.length);
    } else {
        return filename;
    }

    if (dir === '.' || dir === '') {
        return newBase + ext;
    }
    return path.join(dir, newBase + ext);
};

module.exports = (data, oldFilename, newFilename) => {
    if (!data || !data.filename || !oldFilename || !newFilename) {
        return;
    }

    const oldBasename = path.basename(oldFilename, path.extname(oldFilename));
    const newBasename = path.basename(newFilename, path.extname(newFilename));

    data.filename = replaceStem(data.filename, oldBasename, newBasename);

    if (data.sizes) {
        Object.values(data.sizes).forEach((resizedFileData) => {
            if (!resizedFileData || !resizedFileData.filename) {
                return;
            }
            resizedFileData.filename = replaceStem(
                resizedFileData.filename,
                oldBasename,
                newBasename,
            );
        });
    }
};
