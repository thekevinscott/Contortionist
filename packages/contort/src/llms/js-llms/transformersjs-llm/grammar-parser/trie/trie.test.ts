import { BidirectionalMap } from "../bidirectional-map";
import { Trie } from "./trie";

import { makeMockTextGenerationPipeline as _makeMockTextGenerationPipeline } from "../../__mocks__/mock-text-generation-pipeline";

import GBNF from "gbnf";
import type { Vocab } from "../types.js";
import type {
  ByteDecoder,
} from "../../__mocks__/mock-pretrained-tokenizer.js";

const STOP_TOKEN_ID = -999;
const STOP_TOKEN = '<|endoftext|>';

// const decoder = tokenizer.decoder as ByteLevelDecoder;
// const token = tokenizer.model.vocab[tokenId];
// const decodedCodePoints: number[] = [...token,].map(char => parseInt(decoder.byte_decoder[char], 10));
const makeMockTextGenerationPipeline = (vocab: string[]) => {
  const byte_decoder = vocab.reduce<ByteDecoder>((_acc, word) => [...word].reduce<ByteDecoder>((acc, char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      throw new Error(`Could not get code point for ${char}`);
    }
    return {
      ...acc,
      [char]: `${codePoint}`, // though they are numbers, they are stored as strings in the byte decoder
    };
  }, _acc), {});
  return _makeMockTextGenerationPipeline({
    tokenizer: {
      model: {
        vocab,
      },
      decoder: {
        byte_decoder,
      }
    }
  });
};

const getVocab = (words: string[] = []): Vocab => {
  const vocab: Vocab = new BidirectionalMap();
  for (let i = 0; i < words.length; i++) {
    vocab.set(i, words[i]);
  }
  return vocab;
};

const getWordsOfIds = (arr: string[], ids: Set<number>) => {
  const tokenIds: string[] = [];
  for (const id of ids) {
    if (id === STOP_TOKEN_ID) {
      tokenIds.push(STOP_TOKEN);
    } else {
      tokenIds.push(arr[id]);
    }
  }
  return new Set(tokenIds);
};

describe('Trie', () => {
  test('it instantiates', () => {
    const vocab = getVocab();
    const pipeline = makeMockTextGenerationPipeline([]);
    new Trie(vocab, STOP_TOKEN_ID, pipeline);
  });

  describe('getTokensForParseState', () => {
    test.each([
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z',],
        ['f', 'b'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['fo'],
        ['fo'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z', "fo", "ba"],
        ['f', 'b', 'fo', 'ba'],
      ],
      [
        `root ::= "foo" | "bar" | "baz"`,
        ['a', 'b', 'c', 'f', 'x', 'z', "fo", "ba", "foo", "bar", "baz", "fooo", "bazz", "barr"],
        ['f', 'b', 'fo', 'ba', 'foo', 'bar', 'baz'],
      ],
      [
        `root ::= "abcdefg"`,
        ['a', 'b', 'c', 'd', 'ab', 'bc', 'cd', 'abc', 'bcd', 'abcd', 'abcdef'],
        ['a', 'ab', 'abc', 'abcd', 'abcdef'],
      ],
      [
        `root ::= [abcde]`,
        ['a', 'b', 'c', 'd', 'ab', 'bc', 'cd', 'abc', 'bcd', 'abcd', 'abcdef'],
        ['a', 'b', 'c', 'd'],
      ],
      [
        `root ::= "- "`,
        [' ', '-', '- '],
        ['-', '- '],
      ],
      [
        `root ::= "- "`,
        [' ', '-', '- ', '-f'],
        ['-', '- '],
      ],
    ])('CHAR: %s, %s', (grammar, words, expected) => {
      const pipeline = makeMockTextGenerationPipeline(words);
      const vocab = getVocab(words);
      const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
      const parseState = GBNF(grammar);
      const tokens = trie.getTokens(parseState);
      expect(getWordsOfIds(words, tokens)).toEqual(new Set(expected));
    });

    test.each([
      [
        `root ::= [a-f] "012"`,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '0', '1', '2', 'a0', 'b0', 'c0', 'a01', 'a12', 'a012'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'a0', 'b0', 'c0', 'a01', 'a012'],
      ],
      [
        `root ::= [a-fA-F] "012"`,
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', '0', '1', '2', 'a0', 'b0', 'c0', 'a01', 'a12', 'a012', 'A', 'B', 'C', 'C012'],
        ['a', 'b', 'c', 'd', 'e', 'f', 'a0', 'b0', 'c0', 'a01', 'a012', 'A', 'B', 'C', 'C012'],
      ],
    ])('RANGE: %s, %s', (grammar, words, expected) => {
      const pipeline = makeMockTextGenerationPipeline(words);
      const vocab = getVocab(words);
      const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
      const parseState = GBNF(grammar);
      expect(getWordsOfIds(words, trie.getTokens(parseState))).toEqual(new Set(expected));
    });

    test('END', () => {
      const words = ['foo'];
      const pipeline = makeMockTextGenerationPipeline(words);
      const vocab = getVocab(words);
      const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
      const parseState = GBNF(`root ::= "foo"`, 'foo');
      expect(getWordsOfIds(words, trie.getTokens(parseState))).toEqual(new Set([STOP_TOKEN]));
    });

    describe('MODIFIERS', () => {
      test.each([
        [`root ::= [a-d]?`, ['a', 'b', 'c', 'd', STOP_TOKEN], ''],
        [`root ::= [a-d]?`, [STOP_TOKEN], 'a'],
        [`root ::= [a-d]+`, ['a', 'b', 'c', 'd'], ''],
        [`root ::= [a-d]+`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'a'],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], ''],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'a'],
        [`root ::= [a-d]*`, ['a', 'b', 'c', 'd', STOP_TOKEN], 'abcd'],
      ])('%s, %s', (grammar, expected, initial) => {
        const words = ['a', 'b', 'c', 'd'];
        const pipeline = makeMockTextGenerationPipeline(words);
        const vocab = getVocab(words);
        const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
        const parseState = GBNF(grammar, initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState))).toEqual(new Set(expected));
      });

    });

    describe('CHAR_NOT', () => {
      test.each([
        [`root ::= [^a]`, ['b', 'c', 'd'], undefined],
        [`root ::= [^a]`, [STOP_TOKEN], 'b'],
        [`root ::= [^ab]`, ['c', 'd'], undefined],
        [`root ::= [^ab]`, [STOP_TOKEN], 'c'],
        [`root ::= [^abcd]`, [STOP_TOKEN], undefined],
        [`root ::= [^a-c]`, ['d'], undefined],
        [`root ::= [^a]`, [STOP_TOKEN], 'b'],
        [`root ::= [^a] [^a]?`, [STOP_TOKEN, 'b', 'c', 'd'], 'b'],
        [`root ::= [^a-c] | [d-f]`, ['d'], undefined],
      ])('%s, %s', (grammar, expected, initial) => {
        const words = ['a', 'b', 'c', 'd'];
        const pipeline = makeMockTextGenerationPipeline(words);
        const vocab = getVocab(words);
        const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
        const parseState = GBNF(grammar, initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState))).toEqual(new Set(expected));
      });

    });

    test.each([
      [1, ['f', 'b']],
      [2, ['f', 'b', 'fo', 'ba']],
      [3, ['f', 'b', 'fo', 'ba', 'foo', 'bar']],
    ])('limits to a maximum depth of %i', (depth, expected) => {
      const words = ['f', 'fo', 'foo', 'b', 'ba', 'bar'];
      const pipeline = makeMockTextGenerationPipeline(words);
      const grammar = `root ::= "foo" | "bar"`;
      const vocab = getVocab(words);
      const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
      const parseState = GBNF(grammar);
      expect(getWordsOfIds(words, trie.getTokens(parseState, depth))).toEqual(new Set(expected));
    });

    describe('Real world examples', () => {
      test.each([
        [
          `root ::= item+\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '\\n'],
          ['-'],
          '',
        ],
        [
          `root ::= item+\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n'],
          ['-', '- a\\n', '- b\\n'],
          '',
        ],
        [
          `root ::= item+\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n', '- a', '- b'],
          ['-', '- a\\n', '- b\\n', '- a', '- b'],
          '',
        ],
        [
          `root ::= item+\n item ::= "- " [^\\r]+ "\\n" `,
          ['-', ' ', ' a', ' b', '\\r', '\\n', '\\x0b', '\\x0c', '\\x85', '\\u2028', '\\u2029', '- a\\n', '- b\\n', '\\n', '- a', '- b'],
          [' ', ' a', ' b'],
          '-',
        ],
      ])('%s, %s', (grammar, words, expected, initial) => {
        const pipeline = makeMockTextGenerationPipeline(words);
        const vocab = getVocab(words);
        const trie = new Trie(vocab, STOP_TOKEN_ID, pipeline);
        const parseState = GBNF(grammar, initial);
        expect(getWordsOfIds(words, trie.getTokens(parseState))).toEqual(new Set(expected));
      });

    });
  });
});
