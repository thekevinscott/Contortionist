import { vi, } from 'vitest';
import { makeMockTextGenerationPipeline } from "../__mocks__/mock-text-generation-pipeline";
import { GrammarParser, } from './grammar-parser.js';
import { RuleType } from 'gbnf';

describe('GrammarParser', () => {
  test('it instantiates', () => {
    const mockPipeline = makeMockTextGenerationPipeline({
      tokenizer: {
        model: {
          vocab: [],
        }
      }
    });
    new GrammarParser(mockPipeline);
  });

  // // test('it gets tokens', () => {
  // //   const vocabulary: string[] = ['a', 'b', 'c', 'cc'];
  // //   const mockPipeline = makeMockTextGenerationPipeline({
  // //     tokenizer: {
  // //       model: {
  // //         vocab: vocabulary,
  // //       },
  // //       decode: vi.fn().mockImplementation(tokenId => vocabulary[tokenId]),
  // //     },
  // //   });

  // //   const grammarParser = new GrammarParser(mockPipeline, `root ::= "abc"`);

  // //   expect(grammarParser.getTokens('a')).toEqual(new Set([0]));
  // //   expect(grammarParser.getTokens('b')).toEqual(new Set([1]));
  // //   expect(grammarParser.getTokens('c')).toEqual(new Set([2, 3]));
  // // });

  // test('it adds tokens', () => {
  //   const vocabulary: string[] = ['a', 'b', 'c', 'cc'];
  //   const mockPipeline = makeMockTextGenerationPipeline({
  //     tokenizer: {
  //       model: {
  //         vocab: vocabulary,
  //       },
  //       decode: vi.fn().mockImplementation(tokenId => vocabulary[tokenId]),
  //     },
  //   });

  //   const grammarParser = new GrammarParser(mockPipeline, `root ::= "abc"`);

  //   expect([...grammarParser.parseState]).toEqual([{
  //     type: RuleType.CHAR,
  //     value: ['a'.charCodeAt(0)],
  //   }]);

  //   grammarParser.addToken('a');

  //   expect([...grammarParser.parseState]).toEqual([{
  //     type: RuleType.CHAR,
  //     value: ['b'.charCodeAt(0)],
  //   }]);

  //   grammarParser.addToken('b');

  //   expect([...grammarParser.parseState]).toEqual([{
  //     type: RuleType.CHAR,
  //     value: ['c'.charCodeAt(0)],
  //   }]);

  //   grammarParser.addToken('c');

  //   expect([...grammarParser.parseState]).toEqual([{
  //     type: RuleType.END,
  //   }]);
  // });

  // // describe.only('getNextTokenIds', () => {
  // //   test('it gets the next token ids on initialization', () => {
  // //     const vocabulary: string[] = ['x', 'f', 'fo', 'foo', 'b', 'ba', 'bar', 'baz', 'barr', 'bazz', 'fooo', 'z'];
  // //     const mockPipeline = makeMockTextGenerationPipeline({
  // //       tokenizer: {
  // //         model: {
  // //           vocab: vocabulary,
  // //         },
  // //         decode: vi.fn().mockImplementation(tokenId => vocabulary[tokenId]),
  // //       },
  // //     });

  // //     const grammarParser = new GrammarParser(mockPipeline, `root ::= "foo" | "bar" | "baz"`);

  // //     expect(grammarParser.getNextTokenIds()).toEqual(new Set([1, 2, 3, 4, 5, 6, 7,]));
  // //   });

  // //   // test('it gets the next token ids on initialization after adding a character', () => {
  // //   //   const vocabulary: string[] = ['x', 'f', 'fo', 'foo', 'b', 'ba', 'bar', 'baz', 'barr', 'bazz', 'fooo', 'z'];
  // //   //   const mockPipeline = makeMockTextGenerationPipeline({
  // //   //     tokenizer: {
  // //   //       model: {
  // //   //         vocab: vocabulary,
  // //   //       },
  // //   //       decode: vi.fn().mockImplementation(tokenId => vocabulary[tokenId]),
  // //   //     },
  // //   //   });

  // //   //   const grammarParser = new GrammarParser(mockPipeline, `root ::= "foo" | "bar" | "baz"`);

  // //   //   expect(grammarParser.getNextTokenIds()).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  // //   // });
  // // });
});
