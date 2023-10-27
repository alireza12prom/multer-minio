"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioStorageEngine = void 0;
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const minio_1 = require("minio");
class MinioStorageEngine {
    /**
     * @param minio An instance of `Minio` clinet.
     * @param bucket Name of the bucket on `Minio`.
     * @param options Storage options.
     */
    constructor(minio, bucket, options) {
        this.minio = minio;
        this.bucket = bucket;
        this.options = options;
        this.options = this.options || {
            bucket: undefined,
            path: undefined,
            region: undefined,
        };
        this.options.bucket = this.options.bucket || {
            init: false,
            forceDelete: false,
            versioning: false,
        };
        this.options.object = this.options.object || {
            name: undefined,
            useOriginalFilename: false,
        };
        this._init();
    }
    async _init() {
        const { bucket, region } = this.options;
        const exists = await this.minio.bucketExists(this.bucket);
        if (!exists && !bucket.init) {
            throw new Error(`Bucket [${this.bucket}] does not exists.`);
        }
        if (!exists && bucket.init) {
            await this.minio.makeBucket(this.bucket, region || minio_1.DEFAULT_REGION);
            console.log(`Bucket [${this.bucket}] created.`);
        }
        if (bucket.versioning) {
            await this.minio.setBucketVersioning(this.bucket, { Status: bucket.versioning });
            console.log(`Bucket [${this.bucket}] has versioning status [${bucket.versioning}]`);
        }
    }
    _getObjectName(req, file) {
        const { object } = this.options;
        if (object.useOriginalFilename) {
            return file.originalname;
        }
        return object.name ? object.name(req, file) : (0, node_crypto_1.randomUUID)();
    }
    _getObjectPath(objectName) {
        const { path } = this.options;
        return (0, node_path_1.join)(path || '/', objectName);
    }
    async _handleFile(req, file, callback) {
        try {
            file.filename = this._getObjectName(req, file);
            file.path = this._getObjectPath(file.filename);
            await this.minio.putObject(this.bucket, file.path, file.stream, {
                'Content-Type': file.mimetype,
            });
            callback(null, { bucket: this.bucket });
        }
        catch (error) {
            callback(error);
        }
    }
    async _removeFile(req, file, callback) {
        const { bucket } = this.options;
        try {
            const removeOptions = {
                forceDelete: false,
            };
            if (bucket.versioning === 'Enabled' && bucket.forceDelete) {
                removeOptions.forceDelete = true;
            }
            await this.minio.removeObject(this.bucket, file.path, removeOptions);
            callback(null);
        }
        catch (error) {
            callback(error);
        }
    }
}
exports.MinioStorageEngine = MinioStorageEngine;
