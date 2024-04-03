import {
  type ModelDefinition,
  type ModelProtocol,
  modelIsProtocolDefinition,
} from "../types.js";
import {
  LlamafileLLM,
  LlamaCPPLLM,
} from "./endpoint-llms/index.js";
// import { TransformersJSLLM } from "./js-llms/transformersjs-llm/transformersjs-llm.js";

const MODELS = {
  'llamafile': LlamafileLLM,
  'llama.cpp': LlamaCPPLLM,
} as const;
type ModelToLLMMap = {
  [K in keyof typeof MODELS]: InstanceType<typeof MODELS[K]>;
};

export function getLLM<M extends ModelProtocol>(model: ModelDefinition<M>): ModelToLLMMap[M] {
  if (!modelIsProtocolDefinition(model)) {
    throw new Error('not yet implemented');
    //   return new TransformersJSLLM(model);
  }
  if (!MODELS[model.protocol]) {
    throw new Error(`Unsupported model protocol: ${model.protocol}`);
  }
  return new MODELS[model.protocol](model.endpoint) as ModelToLLMMap[M];
};
