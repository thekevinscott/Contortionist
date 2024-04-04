import { LlamafileLLM, } from './llamafile-llm.js';
import { vi } from 'vitest';
import { fetchAPI, } from "../fetch-api/fetch-api.js";
import type * as _fetchAPI from '../fetch-api/fetch-api.js';
import { makeMockLlamaCPPError, makeMockNonStreamingLlamafileResponse, makeMockStreamingLlamafileResponse } from './__fixtures__/make-llamafile-response.js';

vi.mock("../fetch-api/fetch-api.js", async () => {
  const actual = await vi.importActual("../fetch-api/fetch-api.js") as typeof _fetchAPI;
  return {
    ...actual,
    fetchAPI: vi.fn(),
  };
});

describe('LlamaCPPLLM', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it instantiates', () => {
    const llm = new LlamafileLLM('foo');
    expect(llm.endpoint).toEqual('foo');
  });

  test('it calls LLM', async () => {
    const llm = new LlamafileLLM('foo');
    vi.mocked(fetchAPI).mockResolvedValue([
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'foo' })),
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'bar' })),
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'baz' })),
    ]);
    const result = await llm.execute({ prompt: 'foo', n: 1, grammar: 'foo', stream: false, signal: new AbortController().signal });
    expect(result).toEqual('foobarbaz');
  });

  test('it calls LLM streaming', async () => {
    const llm = new LlamafileLLM('foo');
    vi.mocked(fetchAPI).mockResolvedValue([
      JSON.stringify(makeMockStreamingLlamafileResponse({ content: 'foo' })),
      JSON.stringify(makeMockStreamingLlamafileResponse({ content: 'bar' })),
      JSON.stringify(makeMockStreamingLlamafileResponse({ content: 'baz' })),
    ]);
    const result = await llm.execute({ prompt: 'foo', n: 1, grammar: 'foo', stream: true, signal: new AbortController().signal });
    expect(result).toEqual('foobarbaz');
  });

  test('it passes undefined as grammar if empty grammar is defined', async () => {
    // safety check, as llamafile dies if empty grammar is passed
    const llm = new LlamafileLLM('foo');
    vi.mocked(fetchAPI).mockResolvedValue([
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'foo' })),
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'bar' })),
      JSON.stringify(makeMockNonStreamingLlamafileResponse({ content: 'baz' })),
    ]);
    await llm.execute({ prompt: 'foo', n: 1, grammar: '', stream: false, signal: new AbortController().signal });
    expect(fetchAPI).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ grammar: undefined }));
  });

  test('it calls callback if supplied', async () => {
    const llm = new LlamafileLLM('foo');
    const responses = [
      makeMockStreamingLlamafileResponse({ content: 'foo' }),
      makeMockStreamingLlamafileResponse({ content: 'bar' }),
      makeMockStreamingLlamafileResponse({ content: 'baz' }),
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
    const r = await llm.execute({ callback, prompt: 'foo', n: 1, grammar: 'foo', stream: true, signal: new AbortController().signal });
    expect(callback).toHaveBeenCalledWith({ partial: 'foo', chunk: responses[0] });
    expect(callback).toHaveBeenCalledWith({ partial: 'foobar', chunk: responses[1] });
    expect(callback).toHaveBeenCalledWith({ partial: 'foobarbaz', chunk: responses[2] });
  });

  test('it throws error if error is found', async () => {
    const llm = new LlamafileLLM('foo');
    const err = { code: 1, message: 'foo', type: 'bar' };
    vi.mocked(fetchAPI).mockResolvedValue([JSON.stringify(makeMockLlamaCPPError(err))]);
    expect(() => llm.execute({ prompt: 'foo', n: 1, grammar: 'foo', stream: false, signal: new AbortController().signal })).rejects.toThrow(JSON.stringify(err));
  });
});
