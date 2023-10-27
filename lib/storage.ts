import { join } from 'node:path';
import { StorageEngine } from 'multer';
import { randomUUID } from 'node:crypto';
import { IStorageOptions } from './storage.options';
import { Client, DEFAULT_REGION, RemoveOptions } from 'minio';

export class MinioStorageEngine implements StorageEngine {
  /**
   * @param minio An instance of `Minio` clinet.
   * @param bucket Name of the bucket on `Minio`.
   * @param options Storage options.
   */
  constructor(
    public minio: Client,
    public bucket: string,
    public options: IStorageOptions
  ) {
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

  private async _init() {
    const { bucket, region } = this.options;

    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists && !bucket.init) {
      throw new Error(`Bucket [${this.bucket}] does not exists.`);
    }

    if (!exists && bucket.init) {
      await this.minio.makeBucket(this.bucket, region || DEFAULT_REGION);
      console.log(`Bucket [${this.bucket}] created.`);
    }

    if (bucket.versioning) {
      await this.minio.setBucketVersioning(this.bucket, { Status: bucket.versioning });
      console.log(`Bucket [${this.bucket}] has versioning status [${bucket.versioning}]`);
    }
  }

  private _getObjectName(req: Express.Request, file: Express.Multer.File) {
    const { object } = this.options;

    if (object.useOriginalFilename) {
      return file.originalname;
    }

    return object.name ? object.name(req, file) : randomUUID();
  }

  private _getObjectPath(objectName: string) {
    const { path } = this.options;
    return join(path || '/', objectName);
  }

  async _handleFile(req: Express.Request, file: Express.Multer.File, callback: any) {
    try {
      file.filename = this._getObjectName(req, file);
      file.path = this._getObjectPath(file.filename);

      await this.minio.putObject(this.bucket, file.path, file.stream, {
        'Content-Type': file.mimetype,
      });
      callback(null, { bucket: this.bucket });
    } catch (error) {
      callback(error);
    }
  }

  async _removeFile(req: Express.Request, file: Express.Multer.File, callback: any) {
    const { bucket } = this.options;

    try {
      const removeOptions: RemoveOptions = {
        forceDelete: false,
      };

      if (bucket.versioning === 'Enabled' && bucket.forceDelete) {
        removeOptions.forceDelete = true;
      }

      await this.minio.removeObject(this.bucket, file.path, removeOptions);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}
