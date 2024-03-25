import { LlamaCPPLLM, } from './llama-cpp-llm.js';
import { vi } from 'vitest';
import { fetchAPI, } from "../fetch-api/fetch-api.js";
// import { buildResponse } from './build-response.js';
// import { parseChunk } from './parse-chunk.js';
// import { parse, } from "./parse.js";
// import { isError, } from "./is-error.js";
import type * as _fetchAPI from '../fetch-api/fetch-api.js';
// import type * as _parse from './parse.js';
// import type * as _parseChunk from './parse-chunk.js';
// import type * as _buildResponse from './build-response.js';
// import type * as _isError from './is-error.js';
import { makeMockLlamaCPPError, makeMockLlamaCPPResponse } from './__fixtures__/make-llama-cpp-response.js';

vi.mock("../fetch-api/fetch-api.js", async () => {
  const actual = await vi.importActual("../fetch-api/fetch-api.js") as typeof _fetchAPI;
  return {
    ...actual,
    fetchAPI: vi.fn(),
  };
});
// vi.mock("./parse.js", async () => {
//   const actual = await vi.importActual("./parse.js") as typeof _parse;
//   return {
//     ...actual,
//     parse: vi.fn(),
//   };
// });
// vi.mock("./parse-chunk.js", async () => {
//   const actual = await vi.importActual("./parse-chunk.js") as typeof _parseChunk;
//   return {
//     ...actual,
//     parseChunk: vi.fn(),
//   };
// });
// vi.mock("./build-response.js", async () => {
//   const actual = await vi.importActual("./build-response.js") as typeof _buildResponse;
//   return {
//     ...actual,
//     buildResponse: vi.fn(),
//   };
// });
// vi.mock("./is-error.js", async () => {
//   const actual = await vi.importActual("./is-error.js") as typeof _isError;
//   return {
//     ...actual,
//     isError: vi.fn(),
//   };
// });

describe('LlamaCPPLLM', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it instantiates', () => {
    const llm = new LlamaCPPLLM('foo');
    expect(llm.endpoint).toEqual('foo');
  });

  test('it calls LLM', async () => {
    const llm = new LlamaCPPLLM('foo');
    vi.mocked(fetchAPI).mockResolvedValue([
      JSON.stringify(makeMockLlamaCPPResponse({ content: 'foo' })),
      JSON.stringify(makeMockLlamaCPPResponse({ content: 'bar' })),
      JSON.stringify(makeMockLlamaCPPResponse({ content: 'baz' })),
    ]);
    const result = await llm.execute({ prompt: 'foo', n: 1, grammar: 'foo', stream: false, signal: new AbortController().signal });
    expect(result).toEqual('foobarbaz');
  });

  test('it calls callback if supplied', async () => {
    const llm = new LlamaCPPLLM('foo');
    const responses = [
      makeMockLlamaCPPResponse({ content: 'foo' }),
      makeMockLlamaCPPResponse({ content: 'bar' }),
      makeMockLlamaCPPResponse({ content: 'baz' }),
    ]
    vi.mocked(fetchAPI).mockImplementation(async ({ callback }, llmOpts) => {
      return responses.map(r => JSON.stringify(r)).map(r => {
        if (callback) {
          callback(r);
        }
        return r;
      });
    });
    const callback = vi.fn();
    const r = await llm.execute({ callback, prompt: 'foo', n: 1, grammar: 'foo', stream: false, signal: new AbortController().signal });
    expect(callback).toHaveBeenCalledWith({ partial: 'foo', chunk: responses[0] });
    expect(callback).toHaveBeenCalledWith({ partial: 'foobar', chunk: responses[1] });
    expect(callback).toHaveBeenCalledWith({ partial: 'foobarbaz', chunk: responses[2] });
  });

  test('it throws error if error is found', async () => {
    const llm = new LlamaCPPLLM('foo');
    const err = { error: { code: 1, message: 'foo', type: 'bar' } };
    vi.mocked(fetchAPI).mockResolvedValue([JSON.stringify(makeMockLlamaCPPError(err))]);
    expect(() => llm.execute({ prompt: 'foo', n: 1, grammar: 'foo', stream: false, signal: new AbortController().signal })).rejects.toThrow(JSON.stringify(err.error));
  });
});
