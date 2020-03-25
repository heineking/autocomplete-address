import { Address } from './Address';

interface SearchParams {
  number: string;
  street: string;
  lat: number;
  lon: number;
  threshold: number;
}

export type Search = (params: SearchParams) => Promise<Address[]>;
