import { LlamafileResponse, isLlamafileResponseNonStreaming, isLlamafileResponseStreaming, } from "./types.js";

export function getContent<R extends LlamafileResponse>(r?: R): string {
  if (r === undefined) {
    return '';
  }
  if (isLlamafileResponseStreaming(r)) {
    return r.choices[0].delta.content;
  }
  if (isLlamafileResponseNonStreaming(r)) {
    return r.choices[0].message.content;
  }
  throw new Error(`Unknown kind of response: ${JSON.stringify(r)}`);
}
