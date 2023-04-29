import { vi, } from 'vitest';
import type { TokenizeFn, } from "../types.js";
import { Callable, } from './callable.js';
import type { AddToken, GetNextTokenIds, GrammarParser } from '../../../../utils/grammar-parser/grammar-parser.js';

export interface MockGrammarParserArgs {
  getNextTokenIds?: GetNextTokenIds;
  addToken?: AddToken;
}

export const makeMockGrammarParser = ({
  getNextTokenIds = vi.fn(),
  addToken = vi.fn(),
}: MockGrammarParserArgs = {}): GrammarParser => {
  class MockGrammarParser {
    getNextTokenIds = getNextTokenIds;
    addToken = addToken;
  }

  return new MockGrammarParser() as unknown as GrammarParser;
};

