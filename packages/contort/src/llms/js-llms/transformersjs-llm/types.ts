import type {
  Tensor as _Tensor,
  TextGenerationConfig,
} from "@xenova/transformers";
import type {
  Callback as _Callback,
  InternalExecuteOptions,
} from "../../../types.js";
import type { LogitsProcessor, } from "./logits-processor.js";

/** Re-type Transformers.js objects, since otherwise they throw errors */
export type Tensor = {
  data: BigInt64Array;
} & Omit<_Tensor, 'data'>;
export type GenerateFn = (
  inputIds: Tensor,
  config: TextGenerationConfig,
  logitsProcessor: LogitsProcessor,
  options: { inputs_attention_mask: null | Tensor },
) => Promise<OutputTokenIds>;
export type TokenizeFn = (
  text: string | string[],
  options?: {
    text_pair?: string | string[];
    padding?: boolean | 'max_length';
    add_special_tokens?: boolean;
    truncation?: boolean;
    max_length?: number;
    return_tensor?: boolean;
  }) => GenerationOutput;
// export interface DecodeArgs {
//   skip_special_tokens?: boolean; clean_up_tokenization_spaces?: boolean
// }
// export type BatchDecode = (batch: number[][] | Tensor, decode_args?: DecodeArgs) => string[];
// export type Decode = (token_ids: number[] | Tensor, decode_args?: DecodeArgs) => string;

/** Internal types */
export type TransformersJSPrompt = string;
export type Callback = _Callback<'transformers.js', null>;
export interface TransformersJSExecuteOptions extends Omit<InternalExecuteOptions, 'stream'> {
  prompt: TransformersJSPrompt;
  callback: Callback;
}

// export interface TransformersJSCallOpts {
//   prompt: string;
//   n_predict: number;
//   grammar: string;
//   stream: boolean;
// }

export interface TransformersJSError {
  code: number;
  message: string;
  type: string;
}


export interface TransformersJSResponse {
  inputTokens: number[];
  logits: Tensor;
}

export interface GenerationOutput {
  input_ids: Tensor;
  attention_mask: Tensor;
}

export type OutputTokenIds = number[][];
