import { Client } from 'minio';
import { StorageEngine } from 'multer';
interface StorageOptions {
    path?: string;
    initBucket?: boolean;
}
export declare class MinioStorage implements StorageEngine {
    private minio;
    private bucket;
    private options?;
    constructor(minio: Client, bucket: string, options?: StorageOptions);
    init(): Promise<void>;
    _handleFile(req: Express.Request, file: Express.Multer.File, callback: any): Promise<void>;
    _removeFile(req: Express.Request, file: Express.Multer.File, callback: any): Promise<void>;
    private _bucketExists;
    private _initBucket;
    private _getDestination;
}
export {};
