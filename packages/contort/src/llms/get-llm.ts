import {
  type ModelDefinition,
  type ModelProtocol,
  modelIsProtocolDefinition,
  ModelProtocolDefinition,
} from "../types.js";
import {
  LlamafileLLM,
  LlamaCPPLLM,
} from "./endpoint-llms/index.js";
import { TransformersJSLLM, } from "./js-llms/index.js";

const MODELS = {
  'llamafile': LlamafileLLM,
  'llama.cpp': LlamaCPPLLM,
  'transformers.js': TransformersJSLLM,
} as const;
type ModelToLLMMap = {
  [K in keyof typeof MODELS]: InstanceType<typeof MODELS[K]>;
};

export async function getLLM<M extends ModelProtocol>(model: ModelDefinition<M>): Promise<ModelToLLMMap[M]> {
  if (!modelIsProtocolDefinition(model)) {
    return new TransformersJSLLM(await model) as ModelToLLMMap[M];
  }
  if (isProtocol('llama.cpp', model)) {
    return new LlamaCPPLLM(model.endpoint) as ModelToLLMMap[M];
  }
  if (isProtocol('llamafile', model)) {
    return new LlamafileLLM(model.endpoint) as ModelToLLMMap[M];
  }
  throw new Error(`Unsupported model protocol: ${model.protocol}`);
};

function isProtocol<M extends ModelProtocol>(protocol: M, model: ModelProtocolDefinition<ModelProtocol>): model is ModelProtocolDefinition<M> {
  return model.protocol === protocol;
}
