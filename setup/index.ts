import child_process from 'child_process';
import csv from 'csv-parser';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import ProgressBar from 'progress';
import rimraf from 'rimraf';
import stream from 'stream';
import util from 'util';

const config = {
  win: process.platform === 'win32',
  linux: process.platform === 'linux',
  dirs: {
    tmp: path.resolve(__dirname, 'tmp'),
  },
  download: {
    zipfile: path.resolve(__dirname, 'tmp/NAD.zip'),
    extractDir: path.resolve(__dirname, 'tmp/NAD'),
  },
  NAD: {
    file: path.resolve(__dirname, 'tmp/NAD/NAD_r3.txt'),
  },
  csv: {
    file: path.resolve(__dirname, '../addresses.csv'),
  },
  sqlite: {
    db: path.resolve(__dirname, '../api/addresses.db'),
    create: path.resolve(__dirname, './sqlite/create.sql'),
  },
};

const log = (message: string) =>
  console.log(`[${new Date().toLocaleTimeString()}]:: ${message}`);

// =============================================================================
// ensure the temporary directory exists
// =============================================================================
const createDirectory = () => new Promise<void>((resolve, reject) => {
  if (fs.existsSync(config.dirs.tmp)) {
    rimraf.sync(config.dirs.tmp);
  }
  fs.mkdir(config.dirs.tmp, (err) => err ? reject(err) : resolve());
});

// =============================================================================
// download the data
// =============================================================================
const streamPipeline = util.promisify(stream.pipeline);

const download = async () => {
  const response = await fetch('https://nationaladdressdata.s3.amazonaws.com/NAD_r3_revised_ASCII.zip');
  if (!response.ok) {
    throw new Error(`unexpected response: ${response.statusText}`);
  }

  const mb = Math.pow(1024, 2);
  const fileSize = (+(response.headers.get('content-length') || 0) / mb);

  const progressBar = new ProgressBar('  downloading [:bar] :rate/mps :percent :etas', {
    total: fileSize,
    complete: '=',
    incomplete: ' ',
    width: 20,
  });

  const progressUpdate = through2(function update(chunk, encoding, callback) {
    progressBar.tick(chunk.length / mb);
    this.push(chunk);
    callback();
  });

  await streamPipeline(
    response.body,
    progressUpdate,
    fs.createWriteStream(config.download.zipfile),
  );

  progressBar.terminate();
};

// =============================================================================
// extract the file
// =============================================================================
const unzip = () => new Promise(async (resolve, reject) => {
  const { zipfile, extractDir } = config.download;

  const command = config.linux
    ? `unzip ${zipfile} -d ${extractDir}`
    : `powershell Expand-Archive -LiteralPath ${zipfile} -DestinationPath ${extractDir}`;

  const child = child_process.exec(command, (err) => err ? reject(err) : resolve());
  if (child.stdout) {
    child.stdout.on('data', (data) => {
      log(data.toString());
    });
  }
});

// =============================================================================
// normalize the data
// =============================================================================
import { Address } from './Address';
import through2 from 'through2';

const getLines = (filepath: string) => new Promise<number>(async (resolve, reject) => {
  if (config.linux) {
    const exec = util.promisify(child_process.exec);
    const { stdout, stderr } = await exec(`wc -l ${filepath}`);
    const count = +(stdout.toString().trim().split(' ')[0] || 0);
    if (stderr) {
      return reject(stderr.toString());
    }
    return resolve(count);
  } else if (config.win) {
    let count = 0;
    fs
      .createReadStream(filepath)
      .on('data', (chunk) => {
        for (const byte of chunk) {
          if (byte === 10) {
            count += 1;
          }
        }
      })
      .on('close', () => resolve(count))
      .on('error', (err) => reject(err));
  } else {
    throw new Error(`unsupported operating system: ${process.platform}`);
  }
});

const createCsv = () => new Promise(async (resolve, reject) => {
  if (fs.existsSync(config.csv.file)) {
    fs.unlinkSync(config.csv.file);
  }
  const lines = await getLines(config.NAD.file);
  const rstream = fs.createReadStream(config.NAD.file, { autoClose: true });
  const wstream = fs.createWriteStream(config.csv.file);

  const bar = new ProgressBar(' normalizing [:bar] :rate/lps :percent :current/:total', {
    total: lines,
    complete: '=',
    incomplete: ' ',
    width: 20,
  });

  const titleCase = (s: string) => `${s}`
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((w) => `${(w[0] || '').toUpperCase()}${w.slice(1).toLowerCase()}`)
      .join(' ');

  const text = (s: string) => /\s/.test(s) ? `"${s}"` : s;
  const requiredFields = ['number', 'street', 'city', 'region', 'postcode', 'lat', 'lon'];

  let n = 0;
  rstream
    .pipe(csv())
    .on('data', (a: Address) => {
      const data: any = {
        id: ++n,
        number: text(a.Add_Number),
        street: text(titleCase([
          a.StN_PreDir || '',
          a.StreetName || '',
          a.StN_PosTyp || '',
          a.StN_PosDir || '',
        ].join(' '))),
        city: text(titleCase(a.Post_Comm)),
        region: text(a.State),
        postcode: text(a.Zip_Code),
        unit: text(a.Unit),
        floor: text(a.Floor),
        building: text(a.Building),
        lat: isNaN(+a.Latitude) ? '' : a.Latitude,
        lon: isNaN(+a.Longitude) ? '' : a.Longitude,
      };

      const hasRequiredFields = requiredFields
        .every((field: any) => data[field] && data[field].trim() !== '');

      if (hasRequiredFields) {
        const values = Object.values(data).join('|');
        wstream.write(`${values}\n`);
      }
      bar.tick();
    });

  rstream
    .on('close', () => {
      wstream.end();
      wstream.close();
    })
    .on('error', (err) => reject(err));

  wstream
    .on('finish', () => resolve())
    .on('error', (err) => reject(err));
});

// =============================================================================
// create sqlite database
// =============================================================================

const createSqliteDb = async () => new Promise(async (resolve, reject) => {
  if (fs.existsSync(config.sqlite.db)) {
    rimraf.sync(config.sqlite.db);
  }

  const command = `sqlite3 ${config.sqlite.db} < ${config.sqlite.create}`;
  const child = child_process.exec(command, (err) => err ? reject(err) : resolve());

  if (child.stdout) {
    child.stdout.on('data', (data) => log(data.toString()));
  }
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      log(data.toString());
    });
  }
});

// =============================================================================
// create mysql database
// =============================================================================
import mysql from 'mysql';

const conn = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'db',
  flags: ['local-infile'],
  multipleStatements: true,
});

const createSql = fs
  .readFileSync(path.resolve(__dirname, './mysql/create.sql'))
  .toString()
  .replace('@CsvFile', path.normalize(config.csv.file));

const query = (sql: string) => new Promise<any>((resolve, reject) => {
  conn.query(sql, (err, ...results) => err ? reject(err) : resolve(results));
});

const createMySqlDb = async () => {
  try {
    await query(createSql);
  } finally {
    conn.end();
  }
};

// =============================================================================
// create elastic search index
// =============================================================================
import { Client } from '@elastic/elasticsearch';
const client = new Client({ node: 'http://localhost:9200' });

const bulkInsert = async (addresses: any[]) => {
  const body = addresses.reduce<any[]>((xs, address) => {
    const { lat, lon, ...restProps } = address;
    return xs.concat([
      {
        index: {
          _id: address.id,
          _index: 'addresses',
        },
      },
      {
        ...restProps,
        location: {
          lat,
          lon,
        },
      },
    ]);
  }, []);
  await client.bulk({
    index: 'addresses',
    body,
  });
};

const createEsIndex = async () => {
  await fetch('http://localhost:9200/addresses', { method: 'DELETE' });
  await client.indices.create({ index: 'addresses' });
  await client.indices.putMapping({
    index: 'addresses',
    body: {
      properties: {
        location: { type: 'geo_point' },
        region: { type: 'keyword' },
      },
    },
  });

  const count = 20 * 1000;
  const total = await getLines(config.csv.file);

  const bar = new ProgressBar('   indexing [:bar] :rate/aps :percent :current/:total', {
    total,
    complete: '=',
    incomplete: ' ',
    width: 20,
  });

  let addresses: any[] = [];

  const rstream = fs
    .createReadStream(config.csv.file)
    .pipe(csv({
      separator: '|',
      headers: [
        'id',
        'number',
        'street',
        'city',
        'region',
        'postcode',
        'unit',
        'floor',
        'building',
        'lat',
        'lon',
      ],
    }))
    .on('data', (address: any) => {
      addresses.push(address);
      if (addresses.length === count) {
        rstream.pause();
        bulkInsert([...addresses]).then(() => rstream.resume());
        bar.tick(addresses.length);
        addresses = [];
      }
    });

  return new Promise((resolve, reject) => {

    rstream.on('close', () =>
      addresses.length
        ? bulkInsert([...addresses]).then(resolve)
        : resolve(),
    );

    rstream.on('error', (err) => reject(err));
  });
};

// =============================================================================
// kickoff a full setup
// =============================================================================
const setup = async () => {
  log('starting setup');
  await createDirectory();
  log('downloading data');
  await download();
  log('unzipping');
  await unzip();
  log('creating addresses csv');
  await createCsv();
  log('creating sqlite database');
  await createSqliteDb();
  log('creating mysql database');
  await createMySqlDb();
  log('finished');
  log('creating es index');
  await createEsIndex();
  log('finished setting up databases');
};

setup();
