import type {
  TextGenerationPipeline,
} from '@xenova/transformers';
import {
  type MockPretrainedTokenizerArgs,
  makeMockPretrainedTokenizer,
} from './mock-pretrained-tokenizer.js';

export interface MockTextGenerationPipelineArgs {
  tokenizer?: MockPretrainedTokenizerArgs;
}

export const makeMockTextGenerationPipeline = ({
  tokenizer,
}: MockTextGenerationPipelineArgs = {}): TextGenerationPipeline => {
  class MockTextGenerationPipeline {
    tokenizer = makeMockPretrainedTokenizer(tokenizer);
  }

  return new MockTextGenerationPipeline() as unknown as TextGenerationPipeline;
};

