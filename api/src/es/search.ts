import { Client, RequestParams } from '@elastic/elasticsearch';
import { Search, Address } from '../types';

const client = new Client({ node: 'http://es:9200' });

export const search: Search = async (params) => {
  const {
    number: $number,
    lat,
    lon,
    region,
    street,
  } = params;

  const { body } = await client.search({
    index: 'addresses',
    body: {
      query: {
        bool: {
          must: [
            { term: { number: $number } },
            { match: { region } },
            { prefix: { street } },
          ],
          filter: {
            geo_distance: {
              distance: '20km',
              location: {
                lon,
                lat,
              },
            },
          },
        },
      },
    },
  });
  return body.hits.hits.map((hit: any) => hit._source);
};
