import { StreamCallback, } from "../../types.js";

interface CallerOpts {
  prompt: string;
  n_predict: number;
  grammar: string;
  stream: boolean;
  signal: AbortSignal;
}

export class Caller<R> {
  endpoint: string;
  callback?: StreamCallback<R>;
  constructor(endpoint: string, callback?: StreamCallback<R>) {
    this.endpoint = endpoint;
    this.callback = callback;
  }

  fetch = async (endpoint: string, { signal, ...opts }: CallerOpts) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(opts),
      signal,
    });

    if (opts.stream) {
      return this.parseStream(response);
    }

    return response.json();
  };

  parseChunk = (chunk: string) => chunk;
  parseResult = (_result: R) => { };

  partial = '';

  parseStream = async (response: Response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (reader === undefined) {
      throw new Error('Reader is undefined');
    }
    const decoder = new TextDecoder();

    let chunk = '';
    while (true) {
      const { done, value, } = await reader.read();
      chunk += decoder.decode(value, { stream: true, });
      try {
        if (chunk === '' || done) {
          // console.log('done!')
          break;
        }
        const parsedChunk: R = JSON.parse(this.parseChunk(chunk));
        if (this.callback) {
          this.callback({ chunk: parsedChunk, partial: this.partial, });
        }
        chunk = '';
        this.parseResult(parsedChunk);
      } catch (err) {
      }
    }
  };
}

export type ParseChunk = (chunk: string) => string;
export type ParseResult<R> = (result: R) => string;

