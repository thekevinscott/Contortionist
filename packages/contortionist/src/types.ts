import { Tensor, TextGenerationPipeline, } from "@xenova/transformers";
import { LlamaCPPResponse, } from "./llms/endpoint-llms/llama-cpp/types.js";
import { LlamafilePrompt, NonStreamingLlamafileResponse, StreamingLlamafileResponse, } from "./llms/endpoint-llms/llamafile/types.js";
import { LlamaCPPLLM, LlamafileLLM, } from "./llms/endpoint-llms/index.js";

export interface GenerationOutput {
  input_ids: Tensor;
  attention_mask: unknown;
}

export type OutputTokenIds = number[][];

export type ModelProtocol = 'llama.cpp' | 'llamafile';

export interface ModelProtocolDefinition<M extends ModelProtocol> {
  endpoint: string;
  protocol: M;
}

export type ModelDefinition<M extends ModelProtocol | undefined> = ModelProtocolDefinition<M> | TextGenerationPipeline | Promise<TextGenerationPipeline>;
export type Grammar = string;

export function modelIsProtocolDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is ModelProtocolDefinition<M> {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
}

type Chunk<M extends ModelProtocol, S extends boolean> = M extends 'llama.cpp' ? LlamaCPPResponse : M extends 'llamafile' ? (S extends true ? StreamingLlamafileResponse : NonStreamingLlamafileResponse) : undefined;

export type StreamCallback<C> = (opts: {
  chunk: C;
  partial: string
}) => void;

export interface InternalExecuteOptions<C, P = string> {
  prompt: P;
  n: number;
  grammar: string;
  stream: boolean;
  callback?: StreamCallback<C>;
  signal: AbortSignal;
}
// export type Execute<M extends ModelProtocol, S extends boolean> = (opts: InternalExecuteOptions<M, S>) => Promise<string>;
export interface ExternalExecuteOptions<M extends ModelProtocol, S extends boolean> {
  n?: number;
  stream?: S;
  callback?: StreamCallback<Chunk<M, S>>;
  signal?: AbortSignal;
}
export const DEFAULT_N = 20;

export interface ConstructorOptions<M extends ModelProtocol | undefined> {
  grammar?: Grammar;
  model?: ModelDefinition<M>;
}

export type Prompt<M extends ModelProtocol> = M extends 'llama.cpp' ? string : M extends 'llamafile' ? LlamafilePrompt : string;
export type ChosenLLM<M extends ModelProtocol> = M extends 'llama.cpp' ? LlamaCPPLLM : LlamafileLLM;
