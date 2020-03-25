import { Address } from './Address';

export interface SearchParams {
  number: string;
  street: string;
  region: string;
  lat: number;
  lon: number;
  threshold: number;
}

export type Search = (params: SearchParams) => Promise<Address[]>;
