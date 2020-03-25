import mysql from 'mysql';
import { SearchParams, Search } from '../types/Search';
import { Address } from '../types/Address';
import { getBounds } from '../utils/getBounds';

const pool = mysql.createPool({
  connectionLimit: 20,
  host: 'mysql',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'db',
});


const getAddresses = (params: SearchParams): Promise<Address[]> => new Promise((resolve, reject) => {
  const sql = `
    SELECT
      Id as id,
      Number as number,
      Street as street,
      Unit as unit,
      City as city,
      Region as region,
      Postcode as postcode,
      Lat as lat,
      Lon as lon
    FROM Addresses
    WHERE
      	Lat_2 BETWEEN ? AND ?
        AND Lon_2 BETWEEN ? AND ?
        AND Number = ?
        AND Street LIKE ?;
  `;

  const d = 50;
  const lat = Math.round(params.lat * 100);
  const lat1 = lat - d;
  const lat2 = lat + d;
  const lon = Math.round(params.lon * 100);
  const lon1 = lon - d;
  const lon2 = lon + d;

  const queryParams = [
    lat1,
    lat2,
    lon1,
    lon2,
    params.number,
    `${params.street}%`,
  ];

  pool.getConnection((connectionError, connection) => {
    if (connectionError) {
      return reject(connectionError);
    }
    connection.query(sql, queryParams, (queryError, results) => {
      if (queryError) {
        return reject(queryError);
      }
      connection.release();
      return resolve(results);
    });
  });
});

export const search: Search = async (params) => getAddresses(params);
