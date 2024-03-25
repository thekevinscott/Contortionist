import { parseChunk, } from './parse-chunk.js';

describe('parseChunk', () => {
  test('it strips off data prefix', () => {
    expect(parseChunk('data: { "hi": hello }')).toBe(' { "hi": hello }');
  });

  test('it strips off error prefix', () => {
    expect(parseChunk('error: { "hi": hello }')).toBe(' { "hi": hello }');
  });

  test('it handles a missing prefix just fine', () => {
    expect(parseChunk('{ "hi": hello }')).toBe('{ "hi": hello }');
  });
});
