<h1>Minio Storage-Engine For Multer</h1>

[![MinIO](https://raw.githubusercontent.com/minio/minio/master/.github/logo.svg?sanitize=true)](https://min.io)

A simple `Storage Engine` for [Minio][MinioGithub] to upload files there in the middleware level with [Multer][MinioGithub]. To write you own `Storage Engine` check out [this page][MulterStorageEngine].

## How to install it?

To use this package you can easily install it via _npm_:

```
npm install @namatery/multer-minio
```

## How to use it?

> **NOTE 1**: _multer-minio_ is just a storage engine for [Multer][MulterGithub] package so you need to first install it vie [this link][MulterNPM].

> **NOTE 2**: _multer-minio_ needs an instance of `Client` class to connect to [Minio][MinioGithub]. For more information see [Minio API Document][MinioAPIDocument].

### MinioStorageEngine

A a class that you can import it from `@namatery/multer-minio`:

```javascript
const { Client } = require('minio');
const { MinioStorageEngine } = require('@namatery/multer-minio');

const minioClient = new Client({
  port: PORT,
  endPoint: END_POINT,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

const options = {
  path: '/path/in/bucket',
  region: 'us-east-1',
  bucket: {
    init: true,
    versioning: false,
    forceDelete: false,
  },
  object: {
    name: (req, file) => {
      return `${new Date()}-${file.originalname}`;
    },
    useOriginalFilename: false,
  },
};

const storage = new MinioStorageEngine(minioClient, 'test', options);
```

### Options

| Name                       | Description                                                   | Required | Default   |
| -------------------------- | ------------------------------------------------------------- | -------- | --------- |
| path                       | The path of file in the bucket.                               | False    | /         |
| region                     | Region where the bucket is created.                           | False    | us-east-1 |
| bucket.init                | If `ture` the bucket is create if not exists.                 | False    | False     |
| bucket.versioning          | Can be `Enabled` or `Suspended`.                              | False    | False     |
| bucket.forceDelete         | If `true` objects will remove even if versioning was enabled. | False    | False     |
| object.name                | Can be `null` or a function that return name of the object.   | False    | uuid      |
| object.useOriginalFilename | If `true` name of the original file will be use.              | False    | False     |

### Example

Checkout [this link][Example] to see a full example:

- [**Expressjs** & **Javascript**][ExpressJavascriptExample]
- [**Expressjs** & **Typescript**][ExpressTypescriptExample]

[comment]: <> (Links)
[MulterMinio]: https://github.com/alireza12prom/multer-minio
[MulterGithub]: https://github.com/expressjs/multer
[MulterNPM]: https://www.npmjs.com/package/multer
[MulterStorageEngine]: https://github.com/expressjs/multer/blob/master/StorageEngine.md
[MinioGithub]: https://github.com/minio/minio
[MinioAPIDocument]: https://min.io/docs/minio/linux/developers/javascript/API.html
[ExpressJavascriptExample]: ./example/express-javascript.js
[ExpressTypescriptExample]: ./example/express-typescript.ts
