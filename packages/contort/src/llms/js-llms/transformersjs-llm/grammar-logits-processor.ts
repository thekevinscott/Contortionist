import { Tensor, } from "./types.js";
import { maskLogits, } from "./mask-logits.js";
import { GrammarParser, } from "./grammar-parser/grammar-parser.js";
import type { PreTrainedTokenizer, } from "@xenova/transformers";

export type ParseInputTokens = (input_tokens: number[]) => BigInt64Array;
export class GrammarLogitsProcessor {
  tokenizer: PreTrainedTokenizer;
  prompt: string;
  parser: GrammarParser;
  lastLen: number = 0;

  constructor(prompt: string, parser: GrammarParser, tokenizer: PreTrainedTokenizer) {
    this.parser = parser;
    this.tokenizer = tokenizer;
    this.lastLen = prompt.length;
  }

  getAllowedTokenIds(decoded: string): Set<number> {
    const token = decoded.slice(this.lastLen);
    this.parser.addToken(token);
    this.lastLen += token.length;
    return this.parser.getNextTokenIds();
  }

  processors = [(inputTokens: number[], logits: Tensor<Float32Array>) => {
    // if (logits.dims[0] !== this.parser.vocab.size) {
    //   throw new Error(`logits shape ${JSON.stringify(logits.dims)} does not match vocab size ${this.parser.vocab.size}`);
    // }
    const decoded = this.tokenizer.decode(inputTokens);
    const allowedTokenIds = this.getAllowedTokenIds(decoded);
    const maskedLogits = maskLogits(logits, allowedTokenIds);
    // interface Foo {
    //   score: number;
    //   token: string;
    //   codePoint: number[];
    //   tokenId: number;
    // }
    // const translatedLogits: Foo[] = [];
    // const translatedLogitsObj: Record<string, Foo[]> = {};
    // for (let tokenId = 0; tokenId < maskedLogits.data.length; tokenId++) {
    //   const score = maskedLogits.data[tokenId];
    //   // const token = this.parser.vocab.get(tokenId);
    //   const token = this.tokenizer.decode([tokenId,]);
    //   if (token !== undefined) {
    //     const codePoint = token !== "<|endoftext|'>" ? token.split('').map((char) => char.codePointAt(0)) : [];
    //     const foo = {
    //       score,
    //       token,
    //       codePoint,
    //       tokenId,
    //     };
    //     translatedLogits.push(foo);
    //     if (!translatedLogitsObj[token]) {
    //       translatedLogitsObj[token] = [];
    //     }
    //     translatedLogitsObj[token].push(foo);
    //   } else {
    //     // console.warn('token not found', tokenId);
    //   }
    // }
    // console.log(JSON.stringify(translatedLogits.sort((a, b) => b.score - a.score).slice(0, 5), null, 2), translatedLogitsObj);
    return maskedLogits;
  },];

  [Symbol.iterator]() {
    return this.processors.values();
  }
}
