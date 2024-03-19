import { Tensor } from "@xenova/transformers";
import { Tokenizer } from "../llms/js-llms/transformersjs-llm/tokenizer.js";

export abstract class AbstractParser {
  tokenizer: Tokenizer;
  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
  }

  abstract getAllowedTokens(inputTokens: number[], logits: Tensor): (string | number)[];

  nextLex = async (obj: { prompt: string; partialCompletion: string }) => { }

  get shouldContinue() { return true; }
}

