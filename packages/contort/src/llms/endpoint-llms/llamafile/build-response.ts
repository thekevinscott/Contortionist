import { getContent, } from "./get-content.js";
import { parse, } from "./parse.js";
import { LlamafileResponse, } from "./types.js";

export function buildResponse<R extends LlamafileResponse>(response: string[]): R {
  if (response.length === 0) {
    throw new Error('No response from llama.cpp');
  }
  const chunks = response.map(r => parse<R>(r));
  return chunks.slice(1).reduce<R>((obj, r) => ({
    ...obj,
    ...r,
    choices: [{
      finish_reason: '',
      index: 0,
      message: {
        content: getContent(obj) + getContent(r),
        role: 'user',
      },
    },],
  }), chunks[0]);
};

