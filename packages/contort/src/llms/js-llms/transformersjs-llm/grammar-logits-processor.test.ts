import { vi } from 'vitest';
import { GrammarLogitsProcessor } from './grammar-logits-processor.js';
import { makeMockPretrainedTokenizer, } from './__mocks__/mock-pretrained-tokenizer.js';
import { makeMockGrammarParser, } from './__mocks__/mock-grammar-parser.js';

import type { Tensor } from '@xenova/transformers';
import { maskLogits } from './mask-logits.js';
import * as _maskLogits from './mask-logits.js';

vi.mock('./mask-logits.js', async () => {
  const actual = await vi.importActual('./mask-logits.js') as typeof _maskLogits;
  return {
    ...actual,
    maskLogits: vi.fn().mockImplementation(actual.maskLogits),
  };
});

describe('LogitsProcessor', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes', () => {
    const tokenizer = makeMockPretrainedTokenizer();
    const parser = makeMockGrammarParser();
    const prompt = 'foo';
    const logitsProcessor = new GrammarLogitsProcessor(prompt, parser, tokenizer);
    expect(logitsProcessor).not.toBe(undefined);
  });

  it('gets allowed token ids', () => {
    const tokenizer = makeMockPretrainedTokenizer({
      model: {
        vocab: ['a', 'b', 'c', 'd', 'e', 'f',],
      }
    });
    const getNextTokenIds = vi.fn().mockImplementation(() => {
      return new Set([1]);
    });
    const addToken = vi.fn();
    const parser = makeMockGrammarParser({
      getNextTokenIds,
      addToken,
    });
    const prompt = 'a';
    const logitsProcessor = new GrammarLogitsProcessor(prompt, parser, tokenizer);
    expect(logitsProcessor.getAllowedTokenIds(`${prompt}`)).toEqual(new Set([1]));
    expect(addToken).toHaveBeenCalledWith('');
    logitsProcessor.getAllowedTokenIds(`${prompt}b`)
    expect(addToken).toHaveBeenCalledWith('b');
    logitsProcessor.getAllowedTokenIds(`${prompt}bcd`)
    expect(addToken).toHaveBeenCalledWith('cd');
    logitsProcessor.getAllowedTokenIds(`${prompt}bcdef`)
    expect(addToken).toHaveBeenCalledWith('ef');
  });

  it('processors', () => {
    const vocab = ['a', 'b', 'c', 'd', 'e', 'f',];
    const decode = vi.fn().mockImplementation((input) => input.map((i) => vocab[i]).join(''));
    const tokenizer = makeMockPretrainedTokenizer({
      decode,
      model: {
        vocab,
      }
    });
    let state = 1;
    const getNextTokenIds = vi.fn().mockImplementation(() => {
      return new Set([state++]);
    });
    const addToken = vi.fn();
    const parser = makeMockGrammarParser({
      getNextTokenIds,
      addToken,
    });
    const prompt = 'a';
    const logitsProcessor = new GrammarLogitsProcessor(prompt, parser, tokenizer);
    let returnValue;
    let logits = {
      data: Array(vocab.length).fill(1),
    } as unknown as Tensor;
    for (const processor of logitsProcessor) {
      returnValue = processor([0], logits);
    }
    expect(decode).toHaveBeenCalledWith([0]);
    expect(addToken).toHaveBeenCalledWith('');
    expect(logitsProcessor.lastLen).toBe(1);
    expect(maskLogits).toHaveBeenCalledWith(logits, new Set([1]));
    expect(returnValue).toEqual({
      data: [
        -Infinity,
        1,
        -Infinity,
        -Infinity,
        -Infinity,
        -Infinity,
      ]
    });

    // next character: "b"
    logits = {
      data: Array(vocab.length).fill(1),
    } as unknown as Tensor;
    for (const processor of logitsProcessor) {
      returnValue = processor([0, 1], logits);
    }
    expect(decode).toHaveBeenCalledWith([0, 1]);
    expect(addToken).toHaveBeenCalledWith('b');
    expect(logitsProcessor.lastLen).toBe(2);
    expect(maskLogits).toHaveBeenCalledWith(logits, new Set([2]));
    expect(returnValue).toEqual({
      data: [
        -Infinity,
        -Infinity,
        1,
        -Infinity,
        -Infinity,
        -Infinity,
      ]
    });

    // next character: "c"
    logits = {
      data: Array(vocab.length).fill(1),
    } as unknown as Tensor;
    for (const processor of logitsProcessor) {
      returnValue = processor([0, 1, 2], logits);
    }
    expect(decode).toHaveBeenCalledWith([0, 1, 2]);
    expect(addToken).toHaveBeenCalledWith('c');
    expect(logitsProcessor.lastLen).toBe(3);
    expect(maskLogits).toHaveBeenCalledWith(logits, new Set([3]));
    expect(returnValue).toEqual({
      data: [
        -Infinity,
        -Infinity,
        -Infinity,
        1,
        -Infinity,
        -Infinity,
      ]
    });
  });
});
