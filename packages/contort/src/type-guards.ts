import type {
  ModelProtocol,
  ModelDefinition,
  ModelProtocolDefinition,
} from "./types";

export function modelIsProtocolDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is ModelProtocolDefinition<M> {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
};

export function isProtocol<M extends ModelProtocol>(protocol: M, model: ModelProtocolDefinition<ModelProtocol>): model is ModelProtocolDefinition<M> {
  return model.protocol === protocol;
};
