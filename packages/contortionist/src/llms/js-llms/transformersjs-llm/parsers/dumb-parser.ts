import { AbstractParser } from "./abstract-parser.js";

export class DumbParser extends AbstractParser {
  times = 0;

  getAllowedTokens(inputTokens: number[]): string[] {
    // console.log(inputTokens.map(this.tokenizer.decode));
    this.times += 1;
    if (this.times === 2) {
      return ['n'];
    }
    if (this.times === 3) {
      return ['(', ')'];
    }
    return [':', '(', ')', '\n'];
  }

}
