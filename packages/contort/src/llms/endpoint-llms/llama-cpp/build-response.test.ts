import { buildResponse } from './build-response.js';
import { vi } from 'vitest';
import { parse, } from "./parse.js";
import type * as _parse from './parse.js';
import { LlamaCPPResponse } from './types.js';
import { makeMockLlamaCPPResponse, } from './__fixtures__/make-llama-cpp-response.js';

vi.mock("./parse.js", async () => {
  const actual = await vi.importActual("./parse.js") as typeof _parse;
  return {
    ...actual,
    parse: vi.fn(),
  };
});

describe('buildResponse', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it throws if given an empty array', () => {
    expect(() => buildResponse([])).toThrow('No response from llama.cpp');
  });

  test('builds a response', () => {
    vi.mocked(parse).mockImplementation(r => JSON.parse(r) as any as LlamaCPPResponse);
    const response = [
      makeMockLlamaCPPResponse({
        content: 'foo',
        model: 'foo',
      }),
      makeMockLlamaCPPResponse({
        content: 'bar',
        model: 'bar',
      }),
      makeMockLlamaCPPResponse({
        content: 'baz',
        model: 'baz',
      }),
    ];
    expect(buildResponse(response.map(r => JSON.stringify(r)))).toEqual({ ...response[0], content: 'foobarbaz', model: 'baz' });
  });
});
