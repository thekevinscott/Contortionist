import { vi, } from 'vitest';
import type { TokenizeFn, } from "../types.js";
import { Callable, } from './callable.js';
import type { PreTrainedTokenizer, } from '@xenova/transformers';

export interface MockPretrainedTokenizerArgs {
  tokenize?: TokenizeFn;
  special_tokens?: string[];
  decode?: PreTrainedTokenizer['decode'];
}

export const makeMockPretrainedTokenizer = ({
  tokenize = vi.fn(),
  special_tokens = ['<stop>',],
  decode = vi.fn(),
}: MockPretrainedTokenizerArgs = {}): PreTrainedTokenizer => {
  class MockTokenizer extends Callable {
    constructor(call: TokenizeFn) {
      super();
      this._call = call;
    }
    decode = decode;
    batch_decode = vi.fn();
    special_tokens = special_tokens;
  }

  return new MockTokenizer(tokenize) as unknown as PreTrainedTokenizer;
};
