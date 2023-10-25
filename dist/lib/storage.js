"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioStorage = void 0;
const node_path_1 = require("node:path");
class MinioStorage {
    constructor(minio, bucket, options) {
        this.minio = minio;
        this.bucket = bucket;
        this.options = options;
        this.options = this.options || {};
        this.init();
    }
    async init() {
        const exists = await this._bucketExists();
        if (!exists && this.options.initBucket) {
            await this._initBucket();
            console.log(`Bucket [${this.bucket}] created.`);
        }
        else if (!exists) {
            console.log(`Bucket [${this.bucket}] is not exists.`);
        }
    }
    async _handleFile(req, file, callback) {
        try {
            const destin = this._getDestination(file);
            await this.minio.putObject(this.bucket, destin, file.stream, {
                'Content-Type': file.mimetype,
            });
            callback(null, { object: destin, bucket: this.bucket });
        }
        catch (error) {
            callback(error);
        }
    }
    async _removeFile(req, file, callback) {
        try {
            const destin = this._getDestination(file);
            await this.minio.removeObject(this.bucket, destin);
            callback(null);
        }
        catch (error) {
            callback(error);
        }
    }
    _bucketExists() {
        return this.minio.bucketExists(this.bucket);
    }
    _initBucket() {
        return this.minio.makeBucket(this.bucket);
    }
    _getDestination(file) {
        const object = file.filename ? file.filename : file.originalname;
        return this.options.path ? (0, node_path_1.join)(this.options.path, object) : object;
    }
}
exports.MinioStorage = MinioStorage;
