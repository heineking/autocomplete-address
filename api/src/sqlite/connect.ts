import path from 'path';
import sqlite3 from 'sqlite3';

const DB = path.resolve(__dirname, '../../addresses.db');

export const connect = (mode?: number) => new Promise<sqlite3.Database>((resolve, reject) => {
  const db: sqlite3.Database = new sqlite3.Database(DB, mode, (err) => err ? reject(err) : resolve(db));
});
