import { Callback, parseStream, } from "./parse-stream.js";
export type { Callback, } from "./parse-stream.js";

interface FetchOpts {
  parseChunk?: (chunk: string) => string;
  endpoint: string;
  stream: boolean;
  signal: AbortSignal;
  callback?: Callback;
}

export async function fetchAPI<LLMOpts extends object>({ endpoint, stream, signal, callback, parseChunk, }: FetchOpts, llmOpts: LLMOpts): Promise<string[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(llmOpts),
    signal,
  });

  if (stream) {
    return parseStream(response, parseChunk, callback);
  }

  return [await response.text(),];
};
