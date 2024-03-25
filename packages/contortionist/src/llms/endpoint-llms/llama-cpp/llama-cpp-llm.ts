import { fetchAPI, } from "../fetch-api/fetch-api.js";
import { LlamaCPPExecuteOptions, LlamaCPPCallOpts, } from "./types.js";
import { parseChunk, } from './parse-chunk.js';
import { isError, } from "./is-error.js";
import { parse, } from "./parse.js";
import { buildResponse, } from "./build-response.js";


export class LlamaCPPLLM {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  execute = async ({ prompt, callback: _callback, signal, n, grammar, stream, }: LlamaCPPExecuteOptions) => {
    let partial = '';
    const callback = (chunk: string) => {
      if (_callback) {
        const parsedChunk = parse(chunk);
        partial += parsedChunk.content;
        _callback({ partial, chunk: parsedChunk, });
      }
    };
    const response = await fetchAPI<LlamaCPPCallOpts>({
      endpoint: this.endpoint,
      stream,
      signal,
      callback,
      parseChunk,
    }, {
      prompt,
      n_predict: n,
      grammar,
      stream,
    });
    const result = buildResponse(response);
    if (isError(result)) {
      throw new Error(JSON.stringify(result));
    }
    return result.content;
  };
}
