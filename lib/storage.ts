import { Client } from 'minio';
import { StorageEngine } from 'multer';
import { join } from 'node:path';

interface StorageOptions {
  path?: string;
  initBucket?: boolean;
}

export class MinioStorage implements StorageEngine {
  constructor(
    private minio: Client,
    private bucket: string,
    private options?: StorageOptions
  ) {
    this.options = this.options || {};
    this.init();
  }

  async init() {
    const exists = await this._bucketExists();
    if (!exists && this.options.initBucket) {
      await this._initBucket();
      console.log(`Bucket [${this.bucket}] created.`);
    } else if (!exists) {
      console.log(`Bucket [${this.bucket}] is not exists.`);
    }
  }

  async _handleFile(req: Express.Request, file: Express.Multer.File, callback: any) {
    try {
      const destin = this._getDestination(file);
      await this.minio.putObject(this.bucket, destin, file.stream, {
        'Content-Type': file.mimetype,
      });
      callback(null, { object: destin, bucket: this.bucket });
    } catch (error) {
      callback(error);
    }
  }

  async _removeFile(req: Express.Request, file: Express.Multer.File, callback: any) {
    try {
      const destin = this._getDestination(file);
      await this.minio.removeObject(this.bucket, destin);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  private _bucketExists() {
    return this.minio.bucketExists(this.bucket);
  }

  private _initBucket() {
    return this.minio.makeBucket(this.bucket);
  }

  private _getDestination(file: Express.Multer.File) {
    const object = file.filename ? file.filename : file.originalname;
    return this.options.path ? join(this.options.path, object) : object;
  }
}
