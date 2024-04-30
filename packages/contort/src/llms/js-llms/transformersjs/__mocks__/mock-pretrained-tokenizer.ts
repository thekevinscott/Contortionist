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

export const makeByteDecoder = (vocab: string[]): ByteDecoder => {
  return vocab.reduce<ByteDecoder>((_acc, word) => [...word].reduce<ByteDecoder>((acc, char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      throw new Error(`Could not get code point for ${char}`);
    }
    return {
      ...acc,
      [char]: `${codePoint}`, // though they are numbers, they are stored as strings in the byte decoder
    };
  }, _acc), {});
};

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
      convert_tokens_to_ids: vi.fn().mockImplementation((tokens: string[]) => tokens.map(token => model.vocab.indexOf(token))),
      tokens_to_ids: {
        get: vi.fn(),
      },
    };
  }

  return new MockTokenizer(tokenize) as unknown as PreTrainedTokenizer;
};
