import { InternalExecuteOptions as _InternalExecuteOptions, } from "../../types.js";
import { fetchAPI, } from "./fetch-api.js";

type InternalExecuteOptions = _InternalExecuteOptions<'llama.cpp'>;

interface LlamaCPPCallOpts {
  prompt: string;
  n_predict: number;
  grammar: string;
  stream: boolean;
}

export interface LlamaCPPResponse {
  content: string
  generation_settings: {
    "dynatemp_exponent": number;
    "dynatemp_range": number;
    "frequency_penalty": number;
    "grammar": string;
    "ignore_eos": boolean;
    "logit_bias": number[];
    "min_keep": number;
    "min_p": number;
    "mirostat": number;
    "mirostat_eta": number;
    "mirostat_tau": number;
    "model": string;
    "n_ctx": number;
    "n_keep": number;
    "n_predict": number;
    "n_probs": number;
    "penalize_nl": boolean;
    "penalty_prompt_tokens": string[];
    "presence_penalty": number;
    "repeat_last_n": number;
    "repeat_penalty": number;
    "samplers": string[];
    "seed": number[];
    "stop": string[];
    "stream": boolean;
    "temperature": number;
    "tfs_z": number;
    "top_k": number;
    "top_p": number;
    "typical_p": number;
    "use_penalty_prompt_tokens": boolean;
  },
  "id_slot": number;
  "model": string;
  "prompt": string;
  "stop": boolean;
  "stopped_eos": boolean;
  "stopped_limit": boolean;
  "stopped_word": boolean;
  "stopping_word": string;
  "timings": {
    "predicted_ms": number;
    "predicted_n": number;
    "predicted_per_second": number;
    "predicted_per_token_ms": number;
    "prompt_ms": number;
    "prompt_n": number;
    "prompt_per_second": number;
    "prompt_per_token_ms": number;
  },
  "tokens_cached": number;
  "tokens_evaluated": number;
  "tokens_predicted": number;
  "truncated": boolean;
}

interface LlamaCPPError {
  error: {
    code: number;
    message: string;
    type: string;
  }
}

export const isError = (response: LlamaCPPResponse | LlamaCPPError): response is LlamaCPPError => {
  return 'error' in response;
};

export class LlamaCPPLLM {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  execute = async ({ prompt, callback: _callback, externalSignal, internalSignal, n, grammar, stream, }: InternalExecuteOptions) => {
    const signal = externalSignal || internalSignal;
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
    if (!response.length) {
      throw new Error('No response, caller was never called');
    }
    const result = buildResponse(response);
    if (isError(result)) {
      throw new Error(JSON.stringify(result.error));
    }
    return result.content;
  };
}

export const parseChunk = (chunk: string) => chunk.slice(5); // remove "data: "
export const parse = (chunk: string) => JSON.parse(chunk) as LlamaCPPResponse;

export const buildResponse = (response: string[]): LlamaCPPResponse => {
  const chunks = response.map(r => parse(r));
  return chunks.slice(1).reduce<LlamaCPPResponse>((obj, r) => ({
    ...obj,
    ...r,
    content: (obj.content || '') + r.content,
  }), chunks[0]);
};
