import { vi } from 'vitest';
import { parseStream } from "./parse-stream.js";

describe('parseStream', () => {
  test('it throws if response is not ok', () => {
    const response = { ok: false, text: () => '', } as unknown as Response;
    const parseChunk = () => 'foo';
    expect(parseStream(response, parseChunk)).rejects.toThrow('Failed to fetch');
  });

  test('it throws if no body is not available', () => {
    const response = { ok: true, body: undefined } as unknown as Response;
    const parseChunk = () => 'foo';
    expect(parseStream(response, parseChunk)).rejects.toThrow('Reader is undefined');

  });

  test('it throws if no body.reader is not available', () => {
    const response = { ok: true, body: { getReader: () => { } } } as unknown as Response;
    const parseChunk = () => 'foo';
    expect(parseStream(response, parseChunk)).rejects.toThrow('Reader is undefined');
  });

  test('it parses all chunks', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode(JSON.stringify({ i: i++ })), done: i > 3 };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk;
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([JSON.stringify({ i: 0 }), JSON.stringify({ i: 1 }), JSON.stringify({ i: 2 })]);
  });

  test('it returns when done is true', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode(JSON.stringify({ i: i++ })), done: true };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk;
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([]);
  });

  test('it returns if chunk is empty', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode(i > 1 ? '' : JSON.stringify({ i: i++ })), done: false };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk;
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([JSON.stringify({ i: 0 }), JSON.stringify({ i: 1 })]);
  });

  test('it parses chunks correctly', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode('data: ' + JSON.stringify({ i: i++ })), done: i > 3 };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk.split('data: ').pop();
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([JSON.stringify({ i: 0 }), JSON.stringify({ i: 1 }), JSON.stringify({ i: 2 })]);
  });

  test('it handles split chunks correctly', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const lines = ['{"i":0', '}', '{"i":1', '}', '{"i":2', '}'];
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode(lines[i++]), done: i > 6 };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk;
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([JSON.stringify({ i: 0 }), JSON.stringify({ i: 1 }), JSON.stringify({ i: 2 })]);
  });

  test('it parses split chunks correctly', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const lines = ['data: {"i":0', '}', 'data: {"i":1', '}', 'data: {"i":2', '}'];
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode(lines[i++]), done: i > 6 };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk.split('data: ').pop();
    const result = await parseStream(response, parseChunk);
    expect(result).toEqual([JSON.stringify({ i: 0 }), JSON.stringify({ i: 1 }), JSON.stringify({ i: 2 })]);
  });

  test('it calls fetch with a callback', async () => {
    let i = 0;
    const encoder = new TextEncoder();
    const getReader = () => {
      return {
        read: async () => {
          return { value: encoder.encode('data: ' + JSON.stringify({ i: i++ })), done: i > 3 };
        },
      };
    };
    const response = { ok: true, body: { getReader } } as unknown as Response;
    const parseChunk = chunk => chunk.split('data: ').pop();
    const callback = vi.fn();
    await parseStream(response, parseChunk, callback);
    expect(callback).toHaveBeenCalledWith(JSON.stringify({ i: 0 }));
    expect(callback).toHaveBeenCalledWith(JSON.stringify({ i: 1 }));
    expect(callback).toHaveBeenCalledWith(JSON.stringify({ i: 2 }));
  });
});
