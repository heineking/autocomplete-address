import express from 'express';
import proxy from 'http-proxy-middleware';
import path from 'path';

const resolve = (relativePath: string) => path.join(__dirname, '../dist', relativePath);
const app = express();
const HOST = '0.0.0.0';
const PORT = 3000;

app.use('/public', express.static(path.resolve(__dirname, '../dist')));

app.use('/api/addresses', proxy({
  target: `http://api:3001`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/addresses/search': '/search',
  },
}));

app.get('/', (_, res) => {
  return res.sendFile(resolve('/index.html'));
});

app.listen(PORT, HOST);
console.log(`running at: http://${HOST}:${PORT}`);
