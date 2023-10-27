const minio = require('minio');
const multer = require('multer');
const express = require('express');
const { MinioStorageEngine } = require('@namatery/multer-minio');

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
