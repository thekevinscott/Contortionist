import { ModelDefinition, modelIsProtocolDefinition } from "../types.js";
import { LlamafileLLM, LlamaCPPLLM } from "./endpoint-llms/index.js";
import { TransformersJSLLM } from "./js-llms/transformersjs-llm/transformersjs-llm.js";

export const getLLM = (model: ModelDefinition) => {
  if (!modelIsProtocolDefinition(model)) {
    return new TransformersJSLLM(model);
  }
  if (model.protocol === "llama.cpp") {
    return new LlamaCPPLLM(model.endpoint);
  }
  if (model.protocol === "llamafile") {
    return new LlamafileLLM(model.endpoint);
  }

  throw new Error(`Unknown model definition: ${JSON.stringify(model)}`)
};
