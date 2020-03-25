import express from 'express';
import es from './es';
import mysql from './mysql';
import sqlite from './sqlite';

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';

const searches: any = {
  sqlite: (query: any) => sqlite.search(query),
  mysql: (query: any) => mysql.search(query),
  es: (query: any) => es.search(query),
};

const parseQuery = (query: any) => (
  Object
    .entries(query)
    .reduce<any>((acc, [key, value]: any) => {
      return {
        ...acc,
        [key]: typeof value === 'string' && /^-?[0-9.]+$/.test(value)
          ? +value
          : value,
      };
    }, {})
);

app.get('/search', async (req, res) => {
  const query = parseQuery({
    number: '',
    street: '',
    lat: 39.9612,
    lon: -82.9988,
    region: 'OH',
    threshold: 20000,
    engine: 'sqlite',
    ...req.query,
  });

  const search = searches[query.engine];
  const addresses = await search(query);

  res.set('content-type', 'application/json');
  res.send(addresses);
});

app.listen(PORT, HOST);
console.log(`Running at http://${HOST}:${PORT}`);
