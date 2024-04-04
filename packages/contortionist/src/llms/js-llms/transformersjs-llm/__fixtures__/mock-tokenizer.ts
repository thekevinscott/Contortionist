import { vi } from 'vitest';
import { TokenizeFn } from '../types.js';
import { Tokenizer } from '../tokenizer.js';

export interface MockTokenizerArgs {
  decode?: TokenizeFn;
}


export const makeMockTokenizer = ({
  decode = vi.fn().mockImplementation(() => ['']),
}: MockTokenizerArgs = {}): Tokenizer => {
  class MockTokenizer {
    decode = decode;
    encode = vi.fn().mockImplementation(() => ({
      input_ids: { data: [0] },
      attention_mask: { data: [1] },
    }));
  }
  return new MockTokenizer() as unknown as Tokenizer;
};
