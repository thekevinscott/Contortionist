import { vi } from 'vitest';
import { Tensor } from './types.js';
import { GrammarLogitsProcessor } from './grammar-logits-processor.js';
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
    const logitsProcessor = new GrammarLogitsProcessor({
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
    new GrammarLogitsProcessor({
      prompt: 'foo',
      grammar,
    }, {
      tokenizer,
      vocabTrie,
    });
    expect(GBNF).toHaveBeenCalledWith(grammar);
  });

  describe('processors', () => {
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
      const logitsProcessor = new GrammarLogitsProcessor({
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
