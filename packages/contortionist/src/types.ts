import {
  type TextGenerationPipeline,
} from "@xenova/transformers";
import {
  type LlamaCPPPrompt,
  type LlamaCPPResponse,
} from "./llms/endpoint-llms/llama-cpp/types.js";
import {
  type LlamafilePrompt,
  type NonStreamingLlamafileResponse,
  type StreamingLlamafileResponse,
} from "./llms/endpoint-llms/llamafile/types.js";
import { TransformersJSResponse, } from "./llms/js-llms/transformersjs-llm/types.js";


export type ModelProtocol = 'llama.cpp' | 'llamafile' | 'transformers.js';

export interface ModelProtocolDefinition<M extends ModelProtocol> {
  endpoint: string;
  protocol: M;
}

export type ModelDefinition<M extends ModelProtocol | undefined> = ModelProtocolDefinition<M> | TextGenerationPipeline | Promise<TextGenerationPipeline>;
export type Grammar = string;

export function modelIsProtocolDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is ModelProtocolDefinition<M> {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
}

export interface InternalExecuteOptions {
  n: number;
  grammar?: string;
  stream: boolean;
  signal: AbortSignal;
}
export interface ExternalExecuteOptions<M extends ModelProtocol, S extends boolean> {
  n?: number;
  stream?: S;
  callback?: Callback<M, S>;
  signal?: AbortSignal;
}
export const DEFAULT_N = 20;

export interface ConstructorOptions<M extends ModelProtocol | undefined> {
  grammar?: Grammar;
  model?: ModelDefinition<M>;
}

export type Prompt<M extends ModelProtocol> = M extends 'llama.cpp'
  ? LlamaCPPPrompt
  : M extends 'llamafile'
  ? LlamafilePrompt
  : string;

export type Callback<M extends ModelProtocol, S extends boolean | undefined> = (obj: {
  partial: string;
  chunk: M extends 'llamafile' ?
  (S extends true ? StreamingLlamafileResponse : NonStreamingLlamafileResponse)
  : M extends 'llama.cpp' ?
  LlamaCPPResponse
  : M extends 'transformers.js' ?
  TransformersJSResponse
  : never;
}) => void;

export interface ILLM {
  execute<S extends boolean>(obj: {
    prompt: Prompt<ModelProtocol>;
    stream: boolean;
    callback?: Callback<ModelProtocol, S>;
    n: number;
    grammar?: string;
    signal: AbortSignal;
  }): void;
}
