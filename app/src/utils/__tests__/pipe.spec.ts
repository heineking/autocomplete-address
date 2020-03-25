import { expect } from 'chai';
import { pipe } from '../pipe';

describe('pipe', () => {
  it('should execute functions in order', async () => {
    const order: string[] = [];

    await pipe(
      () => order.push('a'),
      () => order.push('b'),
    )();

    expect(order).to.eql(['a', 'b']);
  });

  it('should pass the return value to the next function', async () => {
    const result = await pipe(
      (s: string) => s.toUpperCase(),
      (s: string) => s.split('').reverse().join(''),
    )('abc');
    expect(result).to.equal('CBA');
  });
});
