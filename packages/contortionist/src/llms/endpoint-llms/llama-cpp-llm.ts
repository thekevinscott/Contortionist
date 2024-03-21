import { InternalExecuteOptions } from "../../types.js";
import { Caller } from "./caller.js";

interface LlamaCPPCallOpts {
  prompt: string;
  n_predict: number;
  grammar: string;
  stream: boolean;
  signal: AbortSignal;
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

class LlamaCPPCaller extends Caller<LlamaCPPResponse> {
  result?: LlamaCPPResponse;
  override parseChunk = (chunk: string) => chunk.split('data:').pop()?.trim() || '';
  override parseResult = (result: LlamaCPPResponse) => {
    this.result = {
      ...result,
      content: (this.result?.content || '') + result.content,
    }
    this.partial += result.content;
  };
}

export class LlamaCPPLLM {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  buildOpts = ({
    prompt,
    n,
    grammar,
    stream,
    internalSignal,
    externalSignal,
  }: InternalExecuteOptions<LlamaCPPResponse>): LlamaCPPCallOpts => ({
    prompt,
    n_predict: n,
    grammar,
    stream,
    signal: externalSignal || internalSignal,
  })

  execute = async ({ streamCallback, ...opts }: InternalExecuteOptions<LlamaCPPResponse>) => {
    const builtOpts = this.buildOpts(opts);
    const caller = new LlamaCPPCaller(this.endpoint, streamCallback);
    const response = await caller.fetch(this.endpoint, builtOpts) || caller.result;
    if (!response) {
      throw new Error('No response, caller was never called')
    }
    if (isError(response)) {
      throw new Error(JSON.stringify(response.error));
    }
    return response.content;
  }
}
