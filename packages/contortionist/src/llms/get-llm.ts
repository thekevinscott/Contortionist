import {
  ChosenLLM,
  ModelDefinition,
  ModelProtocol,
  modelIsProtocolDefinition,
} from "../types.js";
import {
  LlamafileLLM,
  LlamaCPPLLM,
} from "./endpoint-llms/index.js";
// import { TransformersJSLLM } from "./js-llms/transformersjs-llm/transformersjs-llm.js";

export function getLLM<M extends ModelProtocol>(model: ModelDefinition<M>): ChosenLLM<M> {
  if (!modelIsProtocolDefinition(model)) {
    throw new Error('not yet implemented');
    //   return new TransformersJSLLM(model);
  }
  if (model.protocol === "llama.cpp") {
    return new LlamaCPPLLM(model.endpoint) as ChosenLLM<M>; // TODO: is there a way to avoid this explicit type cast?
  }
  if (model.protocol === "llamafile") {
    return new LlamafileLLM(model.endpoint) as ChosenLLM<M>; // TODO: is there a way to avoid this explicit type cast?
  }

  throw new Error(`Unknown model definition: ${JSON.stringify(model)}`);
};
