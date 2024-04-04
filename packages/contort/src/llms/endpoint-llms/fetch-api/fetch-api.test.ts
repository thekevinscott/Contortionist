import { vi } from 'vitest';
import { fetchAPI } from './fetch-api.js';

import { parseStream } from './parse-stream.js';
import type * as _parseStream from './parse-stream.js';

vi.mock("./parse-stream.js", async () => {
  const actual = await vi.importActual("./parse-stream.js") as typeof _parseStream;
  return {
    ...actual,
    parseStream: vi.fn(),
  };
});

describe('fetchAPI', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  test('it calls fetch without streaming', async () => {
    const mockReturnValue = 'response';
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => mockReturnValue, });
    const endpoint = 'endpoint';
    const stream = false;
    const signal = new AbortController().signal;
    const callback = () => { };
    const parseChunk = chunk => chunk;
    const llmOpts = {
      foo: 'foo',
    };
    const response = await fetchAPI({
      endpoint,
      stream,
      signal,
      callback,
      parseChunk,
    }, llmOpts)
    expect(global.fetch).toHaveBeenCalledWith(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(llmOpts),
      signal,
    });
    expect(response).toEqual([mockReturnValue]);
    expect(parseStream).not.toHaveBeenCalled();
  });

  test('it calls fetch with streaming', async () => {
    const mockReturnValue = 'response';
    const response = { ok: true, text: () => mockReturnValue, };
    global.fetch = vi.fn().mockResolvedValue(response);
    vi.mocked(parseStream).mockResolvedValue([mockReturnValue, mockReturnValue, mockReturnValue]);
    const endpoint = 'endpoint';
    const stream = true;
    const signal = new AbortController().signal;
    const callback = () => { };
    const parseChunk = chunk => chunk;
    const llmOpts = {
      foo: 'foo',
    };
    const result = await fetchAPI({
      endpoint,
      stream,
      signal,
      callback,
      parseChunk,
    }, llmOpts)
    expect(global.fetch).toHaveBeenCalledWith(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(llmOpts),
      signal,
    });
    expect(parseStream).toHaveBeenCalledWith(response, parseChunk, callback);
    expect(result).toEqual([mockReturnValue, mockReturnValue, mockReturnValue]);
  });
});
