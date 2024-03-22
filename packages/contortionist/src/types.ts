import { Tensor, TextGenerationPipeline } from "@xenova/transformers";
import { LlamaCPPResponse } from "./llms/endpoint-llms/llama-cpp-llm.js";

export interface GenerationOutput {
  input_ids: Tensor;
  attention_mask: any;
}

export type OutputTokenIds = number[][];

export type ModelProtocol = 'llama.cpp' | 'llamafile';

export interface ModelProtocolDefinition {
  endpoint: string;
  protocol: string;
}

export type ModelDefinition = ModelProtocolDefinition | TextGenerationPipeline | Promise<TextGenerationPipeline>;
export type Grammar = string;

export function modelIsProtocolDefinition(model: ModelDefinition): model is ModelProtocolDefinition {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
}

export type StreamCallback<M extends ModelProtocol> = (opts: { chunk: M extends 'llama.cpp' ? LlamaCPPResponse : undefined, partial: string }) => void;

export interface InternalExecuteOptions<M extends ModelProtocol> {
  prompt: string;
  n: number;
  grammar: string;
  stream: boolean;
  streamCallback?: StreamCallback<M>;
  internalSignal: AbortSignal;
  externalSignal?: AbortSignal;
}
export type Execute<M extends ModelProtocol> = (opts: InternalExecuteOptions<M>) => Promise<string>;

export interface ExternalExecuteOptions<M extends ModelProtocol> {
  n?: number;
  stream?: boolean;
  streamCallback?: StreamCallback<M>;
  signal?: AbortSignal;
}
export const DEFAULT_N = 20;

export interface ConstructorOptions {
  grammar?: Grammar;
  model?: ModelDefinition;
}
