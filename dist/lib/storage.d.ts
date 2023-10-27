import { StorageEngine } from 'multer';
import { IStorageOptions } from './storage.options';
import { Client } from 'minio';
export declare class MinioStorageEngine implements StorageEngine {
    minio: Client;
    bucket: string;
    options: IStorageOptions;
    /**
     * @param minio An instance of `Minio` clinet.
     * @param bucket Name of the bucket on `Minio`.
     * @param options Storage options.
     */
    constructor(minio: Client, bucket: string, options: IStorageOptions);
    private _init;
    private _getObjectName;
    private _getObjectPath;
    _handleFile(req: Express.Request, file: Express.Multer.File, callback: any): Promise<void>;
    _removeFile(req: Express.Request, file: Express.Multer.File, callback: any): Promise<void>;
}
