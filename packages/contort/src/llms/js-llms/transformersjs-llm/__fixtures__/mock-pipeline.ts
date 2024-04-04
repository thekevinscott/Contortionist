import { MockPretrainedModelArgs, makeMockPretrainedModel } from './mock-pretrained-model.js';
import {
  makeMockPretrainedTokenizer,
  type MockPretrainedTokenizerArgs,
} from './mock-pretrained-tokenizer.js';
import type { TextGenerationPipeline, } from '@xenova/transformers';

export interface MockPipelineArgs {
  pretrainedTokenizer?: MockPretrainedTokenizerArgs;
  model?: MockPretrainedModelArgs;
}

export const makeMockTextGenerationPipeline = ({ pretrainedTokenizer, model, }: MockPipelineArgs = {}): TextGenerationPipeline => {
  class MockPipeline {
    tokenizer = makeMockPretrainedTokenizer(pretrainedTokenizer);
    model = makeMockPretrainedModel(model);
  }

  return new MockPipeline() as unknown as TextGenerationPipeline;
};

