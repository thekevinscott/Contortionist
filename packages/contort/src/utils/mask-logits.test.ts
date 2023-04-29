import { maskLogits } from './mask-logits.js';

describe('maskLogits', () => {
  test.each([
    [
      [0, 4],
      [0, -Infinity, -Infinity, -Infinity, 4,]
    ],
    [
      [1, 2, 3],
      [-Infinity, 1, 2, 3, -Infinity]
    ],
    [
      [],
      [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity]
    ],
    [
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4]
    ],
    [
      [-1, 6],
      [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity]
    ],
  ])('it masks logits %s', (allowedTokenIds, expectation) => {
    const logits = new Float32Array(5).fill(0).map((_, i) => i);

    expect(maskLogits(logits, new Set(allowedTokenIds))).toEqual(new Float32Array(expectation));
  });
});
