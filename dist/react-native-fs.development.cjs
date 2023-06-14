'use strict';

var RN = require('react-native');
var base64 = require('base-64');
var utf8 = require('utf8');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var RN__default = /*#__PURE__*/_interopDefaultLegacy(RN);
var base64__default = /*#__PURE__*/_interopDefaultLegacy(base64);
var utf8__default = /*#__PURE__*/_interopDefaultLegacy(utf8);

/**
 * React Native FS
 * @flow
 */
var RNFSManager = RN__default['default'].NativeModules.RNFSManager;
var NativeEventEmitter = RN__default['default'].NativeEventEmitter;
var RNFS_NativeEventEmitter = new NativeEventEmitter(RNFSManager);
var RNFSFileTypeRegular = RNFSManager.RNFSFileTypeRegular;
var RNFSFileTypeDirectory = RNFSManager.RNFSFileTypeDirectory;
var isIOS = RN__default['default'].Platform.OS === 'ios';
var jobId = 0;
var getJobId = () => {
    jobId += 1;
    return jobId;
};
var normalizeFilePath = (path) => (path.startsWith('file://') ? path.slice(7) : path);
/**
 * Generic function used by readFile and readFileAssets
 */
function readFileGeneric(filepath, command, encodingOrOptions) {
    var options = {
        encoding: 'utf8'
    };
    if (encodingOrOptions) {
        if (typeof encodingOrOptions === 'string') {
            options.encoding = encodingOrOptions;
        }
        else if (typeof encodingOrOptions === 'object') {
            options = encodingOrOptions;
        }
    }
    return command(normalizeFilePath(filepath)).then((b64) => {
        var contents;
        if (options.encoding === 'utf8') {
            contents = utf8__default['default'].decode(base64__default['default'].decode(b64));
        }
        else if (options.encoding === 'ascii') {
            contents = base64__default['default'].decode(b64);
        }
        else if (options.encoding === 'base64') {
            contents = b64;
        }
        else {
            throw new Error('Invalid encoding type "' + String(options.encoding) + '"');
        }
        return contents;
    });
}
/**
 * Generic function used by readDir and readDirAssets
 */
function readDirGeneric(dirpath, command) {
    return command(normalizeFilePath(dirpath)).then(files => {
        return files.map(file => ({
            ctime: file.ctime && new Date(file.ctime * 1000) || null,
            mtime: file.mtime && new Date(file.mtime * 1000) || null,
            name: file.name,
            path: file.path,
            size: file.size,
            isFile: () => file.type === RNFSFileTypeRegular,
            isDirectory: () => file.type === RNFSFileTypeDirectory,
        }));
    });
}
var RNFS = {
    mkdir(filepath, options = {}) {
        return RNFSManager.mkdir(normalizeFilePath(filepath), options).then(() => void 0);
    },
    moveFile(filepath, destPath, options = {}) {
        return RNFSManager.moveFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
    },
    copyFile(filepath, destPath, options = {}) {
        return RNFSManager.copyFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
    },
    pathForBundle(bundleNamed) {
        return RNFSManager.pathForBundle(bundleNamed);
    },
    pathForGroup(groupName) {
        return RNFSManager.pathForGroup(groupName);
    },
    getFSInfo() {
        return RNFSManager.getFSInfo();
    },
    getAllExternalFilesDirs() {
        return RNFSManager.getAllExternalFilesDirs();
    },
    unlink(filepath) {
        return RNFSManager.unlink(normalizeFilePath(filepath)).then(() => void 0);
    },
    exists(filepath) {
        return RNFSManager.exists(normalizeFilePath(filepath));
    },
    stopDownload(jobId) {
        RNFSManager.stopDownload(jobId);
    },
    resumeDownload(jobId) {
        RNFSManager.resumeDownload(jobId);
    },
    isResumable(jobId) {
        return RNFSManager.isResumable(jobId);
    },
    stopUpload(jobId) {
        RNFSManager.stopUpload(jobId);
    },
    completeHandlerIOS(jobId) {
        return RNFSManager.completeHandlerIOS(jobId);
    },
    readDir(dirpath) {
        return readDirGeneric(dirpath, RNFSManager.readDir);
    },
    // Android-only
    readDirAssets(dirpath) {
        if (!RNFSManager.readDirAssets) {
            throw new Error('readDirAssets is not available on this platform');
        }
        return readDirGeneric(dirpath, RNFSManager.readDirAssets);
    },
    // Android-only
    existsAssets(filepath) {
        if (!RNFSManager.existsAssets) {
            throw new Error('existsAssets is not available on this platform');
        }
        return RNFSManager.existsAssets(filepath);
    },
    // Android-only
    existsRes(filename) {
        if (!RNFSManager.existsRes) {
            throw new Error('existsRes is not available on this platform');
        }
        return RNFSManager.existsRes(filename);
    },
    // Node style version (lowercase d). Returns just the names
    readdir(dirpath) {
        return RNFS.readDir(normalizeFilePath(dirpath)).then(files => {
            return files.map(file => file.name);
        });
    },
    // setReadable for Android
    setReadable(filepath, readable, ownerOnly) {
        return RNFSManager.setReadable(filepath, readable, ownerOnly).then((result) => {
            return result;
        });
    },
    stat(filepath) {
        return RNFSManager.stat(normalizeFilePath(filepath)).then((result) => {
            return {
                'path': filepath,
                'ctime': new Date(result.ctime * 1000),
                'mtime': new Date(result.mtime * 1000),
                'size': result.size,
                'mode': result.mode,
                'originalFilepath': result.originalFilepath,
                isFile: () => result.type === RNFSFileTypeRegular,
                isDirectory: () => result.type === RNFSFileTypeDirectory,
            };
        });
    },
    readFile(filepath, encodingOrOptions) {
        return readFileGeneric(filepath, RNFSManager.readFile, encodingOrOptions);
    },
    read(filepath, length = 0, position = 0, encodingOrOptions) {
        var options = {
            encoding: 'utf8'
        };
        if (encodingOrOptions) {
            if (typeof encodingOrOptions === 'string') {
                options.encoding = encodingOrOptions;
            }
            else if (typeof encodingOrOptions === 'object') {
                options = encodingOrOptions;
            }
        }
        return RNFSManager.read(normalizeFilePath(filepath), length, position).then((b64) => {
            var contents;
            if (options.encoding === 'utf8') {
                contents = utf8__default['default'].decode(base64__default['default'].decode(b64));
            }
            else if (options.encoding === 'ascii') {
                contents = base64__default['default'].decode(b64);
            }
            else if (options.encoding === 'base64') {
                contents = b64;
            }
            else {
                throw new Error('Invalid encoding type "' + String(options.encoding) + '"');
            }
            return contents;
        });
    },
    // Android only
    readFileAssets(filepath, encodingOrOptions) {
        if (!RNFSManager.readFileAssets) {
            throw new Error('readFileAssets is not available on this platform');
        }
        return readFileGeneric(filepath, RNFSManager.readFileAssets, encodingOrOptions);
    },
    // Android only
    readFileRes(filename, encodingOrOptions) {
        if (!RNFSManager.readFileRes) {
            throw new Error('readFileRes is not available on this platform');
        }
        return readFileGeneric(filename, RNFSManager.readFileRes, encodingOrOptions);
    },
    hash(filepath, algorithm) {
        return RNFSManager.hash(normalizeFilePath(filepath), algorithm);
    },
    // Android only
    copyFileAssets(filepath, destPath) {
        if (!RNFSManager.copyFileAssets) {
            throw new Error('copyFileAssets is not available on this platform');
        }
        return RNFSManager.copyFileAssets(normalizeFilePath(filepath), normalizeFilePath(destPath)).then(() => void 0);
    },
    // Android only
    copyFileRes(filename, destPath) {
        if (!RNFSManager.copyFileRes) {
            throw new Error('copyFileRes is not available on this platform');
        }
        return RNFSManager.copyFileRes(filename, normalizeFilePath(destPath)).then(() => void 0);
    },
    // iOS only
    // Copies fotos from asset-library (camera-roll) to a specific location
    // with a given width or height
    // @see: https://developer.apple.com/reference/photos/phimagemanager/1616964-requestimageforasset
    copyAssetsFileIOS(imageUri, destPath, width, height, scale = 1.0, compression = 1.0, resizeMode = 'contain') {
        return RNFSManager.copyAssetsFileIOS(imageUri, destPath, width, height, scale, compression, resizeMode);
    },
    // iOS only
    // Copies fotos from asset-library (camera-roll) to a specific location
    // with a given width or height
    // @see: https://developer.apple.com/reference/photos/phimagemanager/1616964-requestimageforasset
    copyAssetsVideoIOS(imageUri, destPath) {
        return RNFSManager.copyAssetsVideoIOS(imageUri, destPath);
    },
    writeFile(filepath, contents, encodingOrOptions) {
        var b64;
        var options = {
            encoding: 'utf8'
        };
        if (encodingOrOptions) {
            if (typeof encodingOrOptions === 'string') {
                options.encoding = encodingOrOptions;
            }
            else if (typeof encodingOrOptions === 'object') {
                options = {
                    ...options,
                    ...encodingOrOptions
                };
            }
        }
        if (options.encoding === 'utf8') {
            b64 = base64__default['default'].encode(utf8__default['default'].encode(contents));
        }
        else if (options.encoding === 'ascii') {
            b64 = base64__default['default'].encode(contents);
        }
        else if (options.encoding === 'base64') {
            b64 = contents;
        }
        else {
            throw new Error('Invalid encoding type "' + options.encoding + '"');
        }
        return RNFSManager.writeFile(normalizeFilePath(filepath), b64, options).then(() => void 0);
    },
    appendFile(filepath, contents, encodingOrOptions) {
        var b64;
        var options = {
            encoding: 'utf8'
        };
        if (encodingOrOptions) {
            if (typeof encodingOrOptions === 'string') {
                options.encoding = encodingOrOptions;
            }
            else if (typeof encodingOrOptions === 'object') {
                options = encodingOrOptions;
            }
        }
        if (options.encoding === 'utf8') {
            b64 = base64__default['default'].encode(utf8__default['default'].encode(contents));
        }
        else if (options.encoding === 'ascii') {
            b64 = base64__default['default'].encode(contents);
        }
        else if (options.encoding === 'base64') {
            b64 = contents;
        }
        else {
            throw new Error('Invalid encoding type "' + options.encoding + '"');
        }
        return RNFSManager.appendFile(normalizeFilePath(filepath), b64);
    },
    write(filepath, contents, position, encodingOrOptions) {
        var b64;
        var options = {
            encoding: 'utf8'
        };
        if (encodingOrOptions) {
            if (typeof encodingOrOptions === 'string') {
                options.encoding = encodingOrOptions;
            }
            else if (typeof encodingOrOptions === 'object') {
                options = encodingOrOptions;
            }
        }
        if (options.encoding === 'utf8') {
            b64 = base64__default['default'].encode(utf8__default['default'].encode(contents));
        }
        else if (options.encoding === 'ascii') {
            b64 = base64__default['default'].encode(contents);
        }
        else if (options.encoding === 'base64') {
            b64 = contents;
        }
        else {
            throw new Error('Invalid encoding type "' + options.encoding + '"');
        }
        if (position === undefined) {
            position = -1;
        }
        return RNFSManager.write(normalizeFilePath(filepath), b64, position).then(() => void 0);
    },
    downloadFile(options) {
        if (typeof options !== 'object')
            throw new Error('downloadFile: Invalid value for argument `options`');
        if (typeof options.fromUrl !== 'string')
            throw new Error('downloadFile: Invalid value for property `fromUrl`');
        if (typeof options.toFile !== 'string')
            throw new Error('downloadFile: Invalid value for property `toFile`');
        if (options.headers && typeof options.headers !== 'object')
            throw new Error('downloadFile: Invalid value for property `headers`');
        if (options.background && typeof options.background !== 'boolean')
            throw new Error('downloadFile: Invalid value for property `background`');
        if (options.progressDivider && typeof options.progressDivider !== 'number')
            throw new Error('downloadFile: Invalid value for property `progressDivider`');
        if (options.progressInterval && typeof options.progressInterval !== 'number')
            throw new Error('downloadFile: Invalid value for property `progressInterval`');
        if (options.readTimeout && typeof options.readTimeout !== 'number')
            throw new Error('downloadFile: Invalid value for property `readTimeout`');
        if (options.connectionTimeout && typeof options.connectionTimeout !== 'number')
            throw new Error('downloadFile: Invalid value for property `connectionTimeout`');
        if (options.backgroundTimeout && typeof options.backgroundTimeout !== 'number')
            throw new Error('downloadFile: Invalid value for property `backgroundTimeout`');
        var jobId = getJobId();
        var subscriptions = [];
        if (options.begin) {
            subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadBegin', (res) => {
                if (res.jobId === jobId)
                    options.begin(res);
            }));
        }
        if (options.progress) {
            subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadProgress', (res) => {
                if (res.jobId === jobId)
                    options.progress(res);
            }));
        }
        if (options.resumable) {
            subscriptions.push(RNFS_NativeEventEmitter.addListener('DownloadResumable', (res) => {
                if (res.jobId === jobId)
                    options.resumable();
            }));
        }
        var bridgeOptions = {
            jobId: jobId,
            fromUrl: options.fromUrl,
            toFile: normalizeFilePath(options.toFile),
            headers: options.headers || {},
            background: !!options.background,
            progressDivider: options.progressDivider || 0,
            progressInterval: options.progressInterval || 0,
            readTimeout: options.readTimeout || 15000,
            connectionTimeout: options.connectionTimeout || 5000,
            backgroundTimeout: options.backgroundTimeout || 3600000,
            hasBeginCallback: options.begin instanceof Function,
            hasProgressCallback: options.progress instanceof Function,
            hasResumableCallback: options.resumable instanceof Function,
        };
        return {
            jobId,
            promise: RNFSManager.downloadFile(bridgeOptions).then(res => {
                subscriptions.forEach(sub => sub.remove());
                return res;
            })
                .catch(e => {
                return Promise.reject(e);
            })
        };
    },
    uploadFiles(options) {
        if (!RNFSManager.uploadFiles) {
            return {
                jobId: -1,
                promise: Promise.reject(new Error('`uploadFiles` is unsupported on this platform'))
            };
        }
        var jobId = getJobId();
        var subscriptions = [];
        if (typeof options !== 'object')
            throw new Error('uploadFiles: Invalid value for argument `options`');
        if (typeof options.toUrl !== 'string')
            throw new Error('uploadFiles: Invalid value for property `toUrl`');
        if (!Array.isArray(options.files))
            throw new Error('uploadFiles: Invalid value for property `files`');
        if (options.headers && typeof options.headers !== 'object')
            throw new Error('uploadFiles: Invalid value for property `headers`');
        if (options.fields && typeof options.fields !== 'object')
            throw new Error('uploadFiles: Invalid value for property `fields`');
        if (options.method && typeof options.method !== 'string')
            throw new Error('uploadFiles: Invalid value for property `method`');
        if (options.begin) {
            subscriptions.push(RNFS_NativeEventEmitter.addListener('UploadBegin', options.begin));
        }
        else if (options.beginCallback) {
            // Deprecated
            subscriptions.push(RNFS_NativeEventEmitter.addListener('UploadBegin', options.beginCallback));
        }
        if (options.progress) {
            subscriptions.push(RNFS_NativeEventEmitter.addListener('UploadProgress', options.progress));
        }
        else if (options.progressCallback) {
            // Deprecated
            subscriptions.push(RNFS_NativeEventEmitter.addListener('UploadProgress', options.progressCallback));
        }
        var bridgeOptions = {
            jobId: jobId,
            toUrl: options.toUrl,
            files: options.files,
            binaryStreamOnly: options.binaryStreamOnly || false,
            headers: options.headers || {},
            fields: options.fields || {},
            method: options.method || 'POST',
            hasBeginCallback: options.begin instanceof Function || options.beginCallback instanceof Function,
            hasProgressCallback: options.progress instanceof Function || options.progressCallback instanceof Function,
        };
        return {
            jobId,
            promise: RNFSManager.uploadFiles(bridgeOptions).then(res => {
                subscriptions.forEach(sub => sub.remove());
                return res;
            })
        };
    },
    touch(filepath, mtime, ctime) {
        if (ctime && !(ctime instanceof Date))
            throw new Error('touch: Invalid value for argument `ctime`');
        if (mtime && !(mtime instanceof Date))
            throw new Error('touch: Invalid value for argument `mtime`');
        var ctimeTime = 0;
        if (isIOS) {
            ctimeTime = ctime && ctime.getTime();
        }
        return RNFSManager.touch(normalizeFilePath(filepath), mtime && mtime.getTime(), ctimeTime);
    },
    scanFile(path) {
        return RNFSManager.scanFile(path);
    },
    MainBundlePath: RNFSManager.RNFSMainBundlePath,
    CachesDirectoryPath: RNFSManager.RNFSCachesDirectoryPath,
    ExternalCachesDirectoryPath: RNFSManager.RNFSExternalCachesDirectoryPath,
    DocumentDirectoryPath: RNFSManager.RNFSDocumentDirectoryPath,
    DownloadDirectoryPath: RNFSManager.RNFSDownloadDirectoryPath,
    ExternalDirectoryPath: RNFSManager.RNFSExternalDirectoryPath,
    ExternalStorageDirectoryPath: RNFSManager.RNFSExternalStorageDirectoryPath,
    TemporaryDirectoryPath: RNFSManager.RNFSTemporaryDirectoryPath,
    LibraryDirectoryPath: RNFSManager.RNFSLibraryDirectoryPath,
    PicturesDirectoryPath: RNFSManager.RNFSPicturesDirectoryPath,
    FileProtectionKeys: RNFSManager.RNFSFileProtectionKeys
};
module.exports = RNFS;
//# sourceMappingURL=react-native-fs.development.cjs.map
