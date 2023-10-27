import * as minio from 'minio';
import * as multer from 'multer';
import * as express from 'express';
import { MinioStorageEngine } from '@namatery/multer-minio';

const client = new minio.Client({
  port: PORT,
  endPoint: ENDPOINT,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

const storage = new MinioStorageEngine(client, 'test', {
  bucket: { init: true },
});

const app = express();

app.post('/upload', multer({ storage }).single('file'), (req, res) => {
  res.status(201).json(req.file);
});

app.listen(3000, () => {
  console.log('🚀 server: http://localhost:3000');
});
