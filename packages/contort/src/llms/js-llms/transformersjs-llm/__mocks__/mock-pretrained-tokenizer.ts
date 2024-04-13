import { Callable } from './callable.js';

import { vi } from 'vitest';
import type { PreTrainedTokenizer, } from '@xenova/transformers';
import type {
  TokenizeFn,
} from '../types.js';

export type ByteDecoder = Record<string, string>;
export interface MockPretrainedTokenizerArgs {
  tokenize?: TokenizeFn;
  special_tokens?: string[];
  decode?: PreTrainedTokenizer['decode'];
  model?: {
    vocab?: string[];
  };
  decoder?: {
    byte_decoder?: ByteDecoder;
  }
}

export const makeMockPretrainedTokenizer = ({
  tokenize = vi.fn(),
  special_tokens = ['<stop>',],
  decode = vi.fn(),
  model = {
    vocab: [],
  },
  decoder = {},
}: MockPretrainedTokenizerArgs = {}): PreTrainedTokenizer => {
  class MockTokenizer extends Callable {
    constructor(call: TokenizeFn) {
      super();
      this._call = call;
    }
    decode = decode;
    decoder = decoder;
    batch_decode = vi.fn();
    special_tokens = special_tokens;
    getToken = vi.fn();
    model = {
      ...model,
      tokens_to_ids: {
        get: vi.fn(),
      },
    };
  }

  return new MockTokenizer(tokenize) as unknown as PreTrainedTokenizer;
};
