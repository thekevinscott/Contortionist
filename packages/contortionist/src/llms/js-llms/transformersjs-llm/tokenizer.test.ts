import { vi } from 'vitest';
import { DEFAULT_TOKENIZE_ARGS, Tokenizer } from "./tokenizer.js";
import { makeMockTextGenerationPipeline } from './__fixtures__/mock-pipeline.js';

describe('Tokenizer', () => {
  it('initializes with provided pipeline', () => {
    const mockPipeline = makeMockTextGenerationPipeline();
    const tokenizer = new Tokenizer(mockPipeline);
    expect(tokenizer.pipeline).toBe(mockPipeline);
  });

  it("gets the pipeline's tokenizer", () => {
    const mockPipeline = makeMockTextGenerationPipeline();
    const tokenizer = new Tokenizer(mockPipeline);
    expect(tokenizer.tokenizer).toBe(mockPipeline.tokenizer);
  });

  describe('encode', () => {
    it('encodes a particular char', () => {
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [0] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(tokenizer.encode('foo')).toEqual({ input_ids: { data: [0] } });
      expect(tokenize).toHaveBeenCalledWith('foo', DEFAULT_TOKENIZE_ARGS);
    });

    it('encodes a particular char and forwards arguments', () => {
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [0] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize } });
      const tokenizer = new Tokenizer(mockPipeline);
      const args = {
        add_special_tokens: true,
        truncation: false,
      }
      expect(tokenizer.encode('foo', args)).toEqual({ input_ids: { data: [0] } });
      expect(tokenize).toHaveBeenCalledWith('foo', {
        ...DEFAULT_TOKENIZE_ARGS,
        ...args,
      });
    });

    it('can batch encode', () => {
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [0] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(tokenizer.encode(['foo', 'bar', 'baz'])).toEqual({ input_ids: { data: [0] } });
      expect(tokenize).toHaveBeenCalledWith(['foo', 'bar', 'baz'], DEFAULT_TOKENIZE_ARGS);
    });
  });

  describe('getEncodingId', () => {
    test('it encodes a number for a single character', () => {
      const encodingId = 123;
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [BigInt(encodingId)], dims: [1, 1] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(tokenizer.getEncodingId('foo')).toEqual(encodingId);
    });

    test('throws if receiving more than a single encoding id', () => {
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [BigInt(0), BigInt(1)], dims: [1, 2] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(() => tokenizer.getEncodingId('foo')).toThrow();
    });
  });

  describe('stopToken', () => {
    test('it returns stop token', () => {
      const stopToken = 'foo';
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { special_tokens: [stopToken] } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(tokenizer.stopToken).toEqual(stopToken);
    });

    test.each([
      ['undefined', undefined],
      ['number', 123],
      ['array', ['foo']],
    ])('it throws if stop token is %s', (_, stopToken) => {
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { special_tokens: [stopToken as unknown as string] } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(() => tokenizer.stopToken).toThrow();
    });
  });

  describe('stopTokenId', () => {
    test('it returns stop token id', () => {
      const stopToken = 'foo';
      const encodingId = 123;
      const tokenize = vi.fn().mockImplementationOnce(() => ({ input_ids: { data: [BigInt(encodingId)], dims: [1, 1] } }));
      const mockPipeline = makeMockTextGenerationPipeline({ pretrainedTokenizer: { tokenize, special_tokens: [stopToken] } });
      const tokenizer = new Tokenizer(mockPipeline);
      expect(tokenizer.stopTokenId).toEqual(123);
    });
  });
});
