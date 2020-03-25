
import sqlite3 from 'sqlite3';
import { connect } from './connect';
import { Address, Search, SearchParams } from '../types';
import { geodistance } from './geodistance';
import { getBounds } from '../utils/getBounds';

// tslint:disable-next-line: max-line-length
const getAddresses = (params: SearchParams) => new Promise<Address[]>(async (resolve, reject) => {
  const db = await connect(sqlite3.OPEN_READONLY);
  const sql = `
    SELECT
      Id id,
      Number number,
      Street street,
      Unit unit,
      City city,
      Region region,
      Postcode postcode,
      Lat lat,
      Lon lon
    FROM Addresses
    WHERE
      number = ?
      AND street LIKE ?
    ORDER BY street DESC;
  `;

  const queryParams = [
    params.number,
    `${params.street}%`,
  ];

  db.all(sql, queryParams, (err, rows) => {
    return err ? reject(err) : resolve(rows);
  });
});

export const search: Search = async (params) => {
  const {
    lon: lon1,
    lat: lat1,
    threshold,
  } = params;

  const addresses = await getAddresses(params);
  const getDistance = geodistance({ lon: lon1, lat: lat1 });

  return addresses
    .filter((address, index, xs) => {
      const keys: Array<keyof Address> = ['city', 'number', 'postcode', 'street', 'unit', 'region'];
      return xs.findIndex((x) => keys.every((key) => address[key] === x[key])) === index;
    })
    .filter((address) => {
      const { lon: lon2, lat: lat2 } = address;
      const distance = getDistance({ lon: lon2, lat: lat2 });
      return distance <= threshold;
    });
};
