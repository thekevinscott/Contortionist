import { vi } from 'vitest';
import type {
  PreTrainedModel,
} from '@xenova/transformers';

export interface MockPretrainedModelArgs {
}

export const makeMockPretrainedModel = (args: MockPretrainedModelArgs = {}): PreTrainedModel => {
  class MockPretrainedModel {
    generate = vi.fn();
  }

  return new MockPretrainedModel() as unknown as PreTrainedModel;
};
