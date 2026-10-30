const getHashedFilename = require('./get-hashed-filename');
const updateFilename = require('./update-filename');
const getFileHash = require('./get-file-hash');
const fileExists = require('./file-exists');
const incrementName = require('./increment-name');

const MAX_INCREMENT_ATTEMPTS = 1000;

module.exports = (incomingConfig) => {
    const { collections: incomingCollections } = incomingConfig;
    const collections = incomingCollections.map((incomingCollection) => {
        if (!incomingCollection.upload || !incomingCollection.upload.hash) {
            return incomingCollection;
        }
        const incomingCollectionHooks = incomingCollection.hooks ?? {};
        let beforeChangeCollectionHooks = incomingCollectionHooks.beforeChange ?? [];
        beforeChangeCollectionHooks = beforeChangeCollectionHooks.concat(async ({ data, req }) => {
            const reqFile = req.files && req.files.file ? req.files.file : req.file;
            if (!reqFile) {
                return data;
            }
            if (!data || !data.filename) {
                return data;
            }
            if (!reqFile.name || typeof reqFile.name !== 'string') {
                throw new Error('Upload filename is missing or invalid');
            }
            if (reqFile.name.includes('\0')) {
                throw new Error('Filename contains null byte');
            }

            const hashOptions = typeof incomingCollection.upload.hash !== 'boolean'
                ? (incomingCollection.upload.hash ?? {})
                : {};

            const hash = getFileHash(reqFile.data, hashOptions);

            let modifiedFilename = reqFile.name;
            let hashedName = getHashedFilename(modifiedFilename, hash, hashOptions);
            let attempts = 0;
            while (await fileExists(req.payload, incomingCollection.slug, hashedName)) {
                if (++attempts > MAX_INCREMENT_ATTEMPTS) {
                    throw new Error(
                        `Could not generate unique filename after ${MAX_INCREMENT_ATTEMPTS} attempts ` +
                        `(base: ${reqFile.name})`,
                    );
                }
                modifiedFilename = incrementName(modifiedFilename);
                hashedName = getHashedFilename(modifiedFilename, hash, hashOptions);
            }

            updateFilename(data, data.filename, modifiedFilename);
            data.filename = hashedName;

            if (data.sizes) {
                Object.entries(data.sizes).forEach(([key, resizedFileData]) => {
                    if (!resizedFileData || !resizedFileData.filename) {
                        return;
                    }
                    resizedFileData.filename = getHashedFilename(
                        resizedFileData.filename,
                        hash,
                        hashOptions,
                    );
                });
            }

            return data;
        });

        const { hash: remove, ...clonedUpload } = incomingCollection.upload;
        return {
            ...incomingCollection,
            upload: {
                ...clonedUpload,
            },
            hooks: {
                ...incomingCollectionHooks,
                beforeChange: beforeChangeCollectionHooks,
            },
        };
    });
    return {
        ...incomingConfig,
        collections,
    };
};
