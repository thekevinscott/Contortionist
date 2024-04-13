import { vi, } from 'vitest';
import { buildVocab, } from './build-vocab.js';
import {
  makeMockTextGenerationPipeline as _makeMockTextGenerationPipeline,
} from '../__mocks__/mock-text-generation-pipeline.js';
import type {
  MockTextGenerationPipelineArgs,
} from '../__mocks__/mock-text-generation-pipeline.js';
import gpt2Vocab from './__fixtures__/gpt2-vocab.json';
import gpt2DecodedVocab from './__fixtures__/gpt2-decoded-vocab.json';

const makeMockTextGenerationPipeline = (args: Partial<MockTextGenerationPipelineArgs>) => _makeMockTextGenerationPipeline({
  ...args,
  tokenizer: {
    decode: vi.fn(),
    ...args.tokenizer,
    model: {
      vocab: new Array(5).fill('').map((_, i) => `${i}`),
      ...args.tokenizer?.model,
    },
  }
});

describe('buildVocab', () => {
  it('builds a vocabulary mapping from a text generation pipeline', () => {
    // const mockDecode = vi.fn().mockImplementation(tokenId => `Token${tokenId}`);
    const mockPipeline = makeMockTextGenerationPipeline({
      // tokenizer: {
      //   decode: mockDecode,
      // }
    });
    const vocab = buildVocab(mockPipeline);
    const mockTokenizer = mockPipeline.tokenizer;

    for (let tokenId = 0; tokenId < mockTokenizer.model.vocab.length; tokenId++) {
      expect(vocab.get(tokenId)).toBe(`${tokenId}`);
      expect(vocab.reverseGet(`${tokenId}`)).toBe(tokenId);
      // expect(vocab.get(tokenId)).toBe(`Token${tokenId}`);
      // expect(vocab.reverseGet(`Token${tokenId}`)).toBe(tokenId);
    }

    // // Ensure the decode function was called correctly for each token ID
    // expect(mockDecode).toHaveBeenCalledTimes(mockTokenizer.model.vocab.length);
    // for (let tokenId = 0; tokenId < mockTokenizer.model.vocab.length; tokenId++) {
    //   expect(mockDecode).toHaveBeenCalledWith([tokenId]);
    // }
  });

  // it('mimics a real world vocab for gpt2', () => {
  //   const mockPipeline = makeMockTextGenerationPipeline({
  //     tokenizer: {
  //       model: {
  //         vocab: gpt2Vocab,
  //       },
  //       decode: vi.fn().mockImplementation(tokenId => gpt2DecodedVocab[tokenId]),
  //     },
  //   });
  //   const vocab = buildVocab(mockPipeline);

  //   expect(vocab.get(1263)).not.toEqual(gpt2Vocab[1263]);
  //   expect(vocab.get(1263)).toEqual(gpt2DecodedVocab[1263]);
  // });
});
