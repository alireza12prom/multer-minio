import { join } from 'node:path';
import { StorageEngine } from 'multer';
import { Client, DEFAULT_REGION, RemoveOptions } from 'minio';
import { IStorageOptions } from './storage.options';

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

  private _getDestination(file: Express.Multer.File) {
    const object = file.filename ? file.filename : file.originalname;
    return this.options.path ? join(this.options.path, object) : object;
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
    const { bucket } = this.options;

    try {
      const removeOptions: RemoveOptions = {
        forceDelete: false,
      };

      if (bucket.versioning === 'Enabled' && bucket.forceDelete) {
        removeOptions.forceDelete = true;
      }

      const destin = this._getDestination(file);
      await this.minio.removeObject(this.bucket, destin, removeOptions);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}
