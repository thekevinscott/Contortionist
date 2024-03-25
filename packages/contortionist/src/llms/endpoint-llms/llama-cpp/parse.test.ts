import { parse, } from "./parse.js";

describe('parse', () => {
  test('it parses a chunk', () => {
    expect(parse('{"content":"foo"}')).toEqual({ content: 'foo' });
  });
});
