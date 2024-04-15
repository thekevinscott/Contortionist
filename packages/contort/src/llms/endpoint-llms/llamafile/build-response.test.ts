import { buildResponse } from './build-response.js';
import { vi } from 'vitest';
import { LlamafileResponse } from './types.js';
import { makeMockNonStreamingLlamafileResponse, makeMockStreamingLlamafileResponse, } from './__fixtures__/make-llamafile-response.js';
import { parse, } from "./parse.js";
import type * as _parse from './parse.js';

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

  test('builds a response for non-streaming responses', () => {
    vi.mocked(parse).mockImplementation(r => JSON.parse(r) as any as LlamafileResponse);
    const response = [
      makeMockNonStreamingLlamafileResponse({
        content: 'foo',
        model: 'foo',
      }),
      makeMockNonStreamingLlamafileResponse({
        content: 'bar',
        model: 'bar',
      }),
      makeMockNonStreamingLlamafileResponse({
        content: 'baz',
        model: 'baz',
      }),
    ];
    expect(buildResponse(response.map(r => JSON.stringify(r)))).toEqual({
      id: response[0].id,
      created: response[0].created,
      object: response[0].object,
      model: 'baz',
      choices: [{
        ...response[0].choices[0],
        message: {
          ...response[0].choices[0].message,
          content: 'foobarbaz',
        },
      }],
    });
  });

  test('builds a response for streaming responses', () => {
    vi.mocked(parse).mockImplementation(r => JSON.parse(r) as any as LlamafileResponse);
    const response = [
      makeMockStreamingLlamafileResponse({
        content: 'foo',
        model: 'foo',
      }),
      makeMockStreamingLlamafileResponse({
        content: 'bar',
        model: 'bar',
      }),
      makeMockStreamingLlamafileResponse({
        content: 'baz',
        model: 'baz',
      }),
    ];
    expect(buildResponse(response.map(r => JSON.stringify(r)))).toEqual({
      id: response[0].id,
      created: response[0].created,
      object: response[0].object,
      model: 'baz',
      choices: [{
        finish_reason: '',
        index: 0,
        message: {
          content: 'foobarbaz',
          role: 'user',
        },
      }],
    });
  });
});
