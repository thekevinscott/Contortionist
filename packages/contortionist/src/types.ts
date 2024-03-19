import { Tensor, TextGenerationPipeline } from "@xenova/transformers";

export interface GenerationOutput {
  input_ids: Tensor;
  attention_mask: any;
}

export type OutputTokenIds = number[][];

export type ModelProtocol = 'llama.cpp' | 'llamafile';

export interface ModelProtocolDefinition {
  endpoint: string;
  protocol: ModelProtocol;
}

export type ModelDefinition = ModelProtocolDefinition | TextGenerationPipeline | Promise<TextGenerationPipeline>;
export type Grammar = string;

export const modelIsProtocolDefinition = (model: ModelDefinition): model is ModelProtocolDefinition => {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
}

export type StreamCallback<R> = (opts: { chunk: R, partial: string }) => void;

export interface InternalExecuteOptions<R> {
  prompt: string;
  n: number;
  grammar: string;
  stream: boolean;
  streamCallback?: StreamCallback<R>;
}
export type Execute<R> = (opts: InternalExecuteOptions<R>) => Promise<string>;

export interface ExternalExecuteOptions<R> {
  n?: number;
  stream?: boolean;
  streamCallback?: StreamCallback<R>;
}
export const DEFAULT_N = 20;

export interface ContortionistOptions {
  grammar: Grammar;
  model: ModelDefinition;
}
