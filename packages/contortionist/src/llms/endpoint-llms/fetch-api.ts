interface FetchOpts {
  parseChunk?: (chunk: string) => string;
  endpoint: string;
  stream: boolean;
  signal: AbortSignal;
  callback?: Callback;
}

export type Callback = (chunk: string) => void;

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

const DEFAULT_PARSE_CHUNK = (chunk: string) => chunk;

export async function parseStream(response: Response, parseChunk = DEFAULT_PARSE_CHUNK, callback?: Callback): Promise<string[]> {
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (reader === undefined) {
    throw new Error('Reader is undefined');
  }
  const decoder = new TextDecoder();

  const chunks: string[] = [];
  let chunk = '';
  while (true) {
    const { done, value, } = await reader.read();
    chunk += decoder.decode(value, { stream: true, });
    try {
      if (chunk === '' || done) {
        break;
      }
      const parsedChunk = parseChunk(chunk);
      JSON.parse(parsedChunk); // see if we're done with this particular chunk
      if (callback) {
        callback(parsedChunk);
      }
      chunks.push(parsedChunk);
      chunk = '';
    } catch (err) {

    }
  }
  return chunks;
};
