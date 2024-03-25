import { parseChunk, } from './parse-chunk.js';

describe('parseChunk', () => {
  test('it strips off data prefix', () => {
    expect(parseChunk('data: hello')).toBe(' hello');
  });
});
