import { parse, } from "./parse.js";
import { LlamaCPPResponse, } from "./types.js";

export const buildResponse = (response: string[]): LlamaCPPResponse => {
  if (response.length === 0) {
    throw new Error('No response from llama.cpp');
  }
  const chunks = response.map(r => parse(r));
  return chunks.slice(1).reduce<LlamaCPPResponse>((obj, r) => ({
    ...obj,
    ...r,
    content: (obj.content || '') + r.content,
  }), chunks[0]);
};
