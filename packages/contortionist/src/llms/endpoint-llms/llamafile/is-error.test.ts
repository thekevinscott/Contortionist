import { isError } from "./is-error.js";
import { LlamafileResponse } from "./types.js";

describe('isError', () => {
  test('it returns false if not an error', () => {
    expect(isError({ content: 'foo' } as LlamafileResponse)).toBe(false);
  });

  test('it returns true if an error', () => {
    expect(isError({
      code: 1,
      message: 'message',
      type: 'type',
    })).toBe(true);
  });
});
