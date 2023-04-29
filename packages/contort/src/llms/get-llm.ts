import {
  isProtocol,
  isTransformersJSModelDefinition,
  isWebLLMModelDefinition,
} from '../type-guards.js';
import type {
  ModelDefinition,
  ModelProtocol,
} from "../types.js";
import {
  LlamafileLLM,
  LlamaCPPLLM,
  TransformersJSLLM,
  WebLLM,
} from "./llms.js";
const MODELS = {
  'llamafile': LlamafileLLM,
  'llama.cpp': LlamaCPPLLM,
  'transformers.js': TransformersJSLLM,
  'web-llm': WebLLM,
} as const;
type ModelToLLMMap = {
  [K in keyof typeof MODELS]: InstanceType<typeof MODELS[K]>;
};
export async function getLLM<M extends ModelProtocol>(_model: ModelDefinition<M>): Promise<ModelToLLMMap[M]> {
  const model = await _model;
  if (isTransformersJSModelDefinition(model)) {
    return new TransformersJSLLM(model) as ModelToLLMMap[M];
  }
  if (isWebLLMModelDefinition(model)) {
    return new WebLLM(model) as ModelToLLMMap[M];
  }
  if (isProtocol('llama.cpp', model)) {
    return new LlamaCPPLLM(model.endpoint) as ModelToLLMMap[M];
  }
  if (isProtocol('llamafile', model)) {
    return new LlamafileLLM(model.endpoint) as ModelToLLMMap[M];
  }
  throw new Error(`Unsupported model protocol: ${model.protocol}`);
};
