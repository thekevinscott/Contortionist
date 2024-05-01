import type {
  ModelProtocol,
  ModelDefinition,
  ModelProtocolDefinition,
} from "./types.js";

export function modelIsProtocolDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is ModelProtocolDefinition<M> {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
};

export function isProtocol<M extends ModelProtocol>(protocol: M, model: ModelProtocolDefinition<ModelProtocol>): model is ModelProtocolDefinition<M> {
  return modelIsProtocolDefinition(model) && model.protocol === protocol;
};
