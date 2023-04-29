import { fetchAPI, } from "../fetch-api/fetch-api.js";
import { LlamaCPPExecuteOptions, LlamaCPPCallOpts, } from "./types.js";
import { parseChunk, } from './parse-chunk.js';
import { isError, } from "./is-error.js";
import { parse, } from "./parse.js";
import { buildResponse, } from "./build-response.js";
import type { LLMInterface, } from "../../../types.js";
export class LlamaCPPLLM implements LLMInterface {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  async execute<S extends boolean>({
    prompt,
    stream,
    callback: _callback,
    grammar,
    signal,
    ...rest
  }: LlamaCPPExecuteOptions<S>) {
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
      ...rest,
      prompt,
      grammar,
      stream,
    });
    const result = buildResponse(response);
    if (isError(result)) {
      throw new Error(JSON.stringify(result));
    }
    return result.content;
  }
}
