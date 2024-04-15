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
});
