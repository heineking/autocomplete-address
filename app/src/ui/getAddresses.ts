import { Address } from '../types';
import { createToken } from '../utils';

export const getAddresses = (queryString: string) => {
  const token = createToken<Address[]>();

  fetch(`/api/addresses/search?${queryString}`)
    .then((res) => res.json())
    .then((json) => token.resolve(json))
    .catch((err) => token.reject(err));

  return {
    task: token.promise,
    cancel: token.cancel,
  };
};
