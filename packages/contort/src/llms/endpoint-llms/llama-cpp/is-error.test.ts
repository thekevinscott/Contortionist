import { isError } from "./is-error.js";
import { LlamaCPPResponse } from "./types.js";

describe('isError', () => {
  test('it returns false if not an error', () => {
    expect(isError({ content: 'foo' } as LlamaCPPResponse)).toBe(false);
  });

  test('it returns true if an error', () => {
    expect(isError({
      code: 1,
      message: 'message',
      type: 'type',
    })).toBe(true);
  });
});
