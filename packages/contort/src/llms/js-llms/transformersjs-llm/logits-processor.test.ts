import { vi } from 'vitest';
import { Tensor } from './types.js';
import { LogitsProcessor } from './logits-processor.js';
import { makeMockTokenizer, } from './__fixtures__/mock-tokenizer.js';
import { makeMockVocabTrie, } from './__fixtures__/mock-vocab-trie.js';

import GBNF from 'gbnf';
import type * as _GBNF from 'gbnf';

vi.mock("gbnf", async () => {
  const actual = await vi.importActual("gbnf") as typeof _GBNF;
  return {
    ...actual,
    default: vi.fn(),
  };
});

describe('LogitsProcessor', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes', () => {
    const tokenizer = makeMockTokenizer();
    const vocabTrie = makeMockVocabTrie();
    const logitsProcessor = new LogitsProcessor({
      prompt: 'foo',
      grammar: null,
    }, {
      tokenizer,
      vocabTrie,
    });
    expect(logitsProcessor).not.toBe(undefined);
  });

  it('initializes and parses a grammar when one is provided', () => {
    const tokenizer = makeMockTokenizer();
    const vocabTrie = makeMockVocabTrie();
    const grammar = 'grammar';
    new LogitsProcessor({
      prompt: 'foo',
      grammar,
    }, {
      tokenizer,
      vocabTrie,
    });
    expect(GBNF).toHaveBeenCalledWith(grammar);
  });

  describe('processors', () => {
    it('calls the callback with the decoded input tokens', () => {
      const callback = vi.fn();
      const decode = vi.fn().mockImplementation((arg) => `i${arg[0]}`);
      const tokenizer = makeMockTokenizer({
        decode,
      });
      const vocabTrie = makeMockVocabTrie();
      const logitsProcessor = new LogitsProcessor({
        prompt: 'foo',
        grammar: null,
        callback,
      }, {
        tokenizer,
        vocabTrie,
      });

      let i = 0;
      for (let i = 0; i < 3; i++) {
        for (const processor of logitsProcessor) {
          processor([i], {
            i,
          } as unknown as Tensor);
        }
      }
      for (let i = 0; i < 3; i++) {
        expect(decode).toHaveBeenCalledWith([i])
        expect(callback).toHaveBeenCalledWith({
          partial: `i${i}`,
          chunk: {
            inputTokens: [i],
            logits: {
              i,
            },
          }
        });
      }
    });

    it('returns logits unadulterated if no grammar is provided', () => {
      const decode = vi.fn();
      const tokenizer = makeMockTokenizer({
        decode,
      });
      const vocabTrie = makeMockVocabTrie();
      const logitsProcessor = new LogitsProcessor({
        prompt: 'foo',
        grammar: null,
      }, {
        tokenizer,
        vocabTrie,
      });

      let returnValue;
      const logits = {
        i: 0,
      } as unknown as Tensor;
      for (const processor of logitsProcessor) {
        returnValue = processor([0], logits);
      }
      expect(returnValue).toEqual(logits);
    });

    it('returns modified logits for a given grammar', () => {
      const decode = vi.fn().mockImplementation(() => {
        return 'bar';
      });
      vi.mocked(GBNF).mockImplementation(() => {
        class MockParseState {
          *[Symbol.iterator]() {
            for (let i = 0; i < 3; i++) {
              yield i;
            }
          }
        }

        return new MockParseState();
      })
      const tokenizer = makeMockTokenizer({
        decode,
      });
      const getTokens = vi.fn().mockImplementation(([i]) => {
        if (i === 1) {
          return [{ id: i, }];
        }
        return [];
      });
      const vocabTrie = makeMockVocabTrie({
        getTokens,
      });
      const logitsProcessor = new LogitsProcessor({
        prompt: 'foo',
        grammar: 'grammar',
      }, {
        tokenizer,
        vocabTrie,
      });

      let returnValue;
      const logits = {
        data: [1, 1, 1],
      } as unknown as Tensor;
      for (const processor of logitsProcessor) {
        returnValue = processor([0], logits);
      }
      expect(returnValue).toEqual({
        data: [
          -Infinity,
          1,
          -Infinity,
        ]
      });
    });
  });
});
