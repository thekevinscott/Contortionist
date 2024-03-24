import { Tokenizer, } from "../../llms/js-llms/transformersjs-llm/tokenizer.js";
import { AbstractParser, } from "../abstract-parser.js";
// import { get_parser as helloWorldParser } from './hello_world_parser.js';
import { get_parser as JSONParser, } from './grammars/json/json-parser.js';

export class LarkJSParser extends AbstractParser {
  times = 0;

  parser = JSONParser();
  terminals = new Map<string, RegExp>();
  decodedTokens = new Map<number, string>();
  validNextLex = new Set<string>();
  constructor(tokenizer: Tokenizer) {
    super(tokenizer);
    tokenizer.vocab.forEach((_word: string, token_id: number) => {
      this.decodedTokens.set(token_id, tokenizer.decode(token_id) as string);
    });
    for (const terminal of this.parser.terminals) {
      if (terminal.pattern) {
        console.log(terminal.pattern);
        const re: any = new RegExp(terminal.pattern.to_regexp());
        // console.log('re', re, terminal.pattern);
        this.terminals.set(terminal.name, re);
      }
    }
  }

  nextLex = async ({ partialCompletion, }) => {
    const interactive = this.parser.parse_interactive(partialCompletion);
    interactive.exhaust_lexer();
    this.validNextLex = interactive.accepts();
  };

  get shouldContinue() {
    if (this.validNextLex.size === 0 || (this.validNextLex.size === 1 && this.validNextLex.has('$END'))) {
      // console.log('should not continue')
      return false;
    }
    return true;
  }

  getAllowedTokens = (inputTokens: number[]): number[] => {
    const patterns = Array.from(this.validNextLex).map((t: string) => {
      const re = new RegExp(this.terminals.get(t));
      return {
        t,
        re,
      };
    });
    // console.log('patterns', patterns)
    const validTokenIds: number[] = [];
    for (const [tokenId, word,] of this.decodedTokens) {
      for (const { re, t, } of patterns) {
        if (re.test(word)) {
          validTokenIds.push(tokenId);
          break;
        }
      }
    }
    return validTokenIds;
  };
}
