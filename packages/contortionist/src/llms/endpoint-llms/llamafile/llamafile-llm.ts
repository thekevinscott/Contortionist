import { fetchAPI, } from "../fetch-api/fetch-api.js";
import { buildResponse, } from "./build-response.js";
import { parse, } from "./parse.js";
import { parseChunk, } from "./parse-chunk.js";
import { LlamafileExecuteOptions, } from "./types.js";
import { getContent, } from "./get-content.js";
import { isError, } from "./is-error.js";
import { getMessages, } from "./get-messages.js";

export class LlamafileLLM {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  execute = async ({ prompt, callback: _callback, signal, n, grammar, stream, }: LlamafileExecuteOptions) => {
    let partial = '';
    const callback = (chunk: string) => {
      if (_callback) {
        const parsedChunk = parse(chunk);
        partial += getContent(parsedChunk);
        _callback({ partial, chunk: parsedChunk, });
      }
    };
    const response = await fetchAPI({
      endpoint: this.endpoint,
      stream,
      signal,
      callback,
      parseChunk,
    }, {
      messages: getMessages(prompt),
      n,
      grammar: !grammar ? undefined : grammar,
      stream,
    });
    if (!response.length) {
      throw new Error('No response, caller was never called');
    }
    const result = buildResponse(response);
    if (isError(result)) {
      throw new Error(JSON.stringify(result));
    }
    return getContent(result);
  };
}
