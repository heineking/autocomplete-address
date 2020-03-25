interface Token<T> {
  promise: Promise<T>;
  resolve: (t: T) => void;
  reject: (reason: any) => void;
  cancel: (reason?: string) => void;
}

export class CancelationToken extends Error {}

export const createToken = <T>(): Token<T> => {
  const token: Partial<Token<T>> = {};

  token.promise = new Promise<T>((resolve, reject) => {
    token.resolve = resolve;
    token.reject = reject;
    token.cancel = (reason?: string) => {
      reject(new CancelationToken(reason));
    };
  });

  return token as Token<T>;
};
