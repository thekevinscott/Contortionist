import { Tokenizer, } from "./tokenizer.js";
import GBNF, { ParseState, } from 'gbnf';
import { Token, VocabTrie, } from "./vocab-trie.js";
import { Callback, Tensor, } from "./types.js";
import { maskLogits, } from "./mask-logits.js";

// type TokenIds = number[];

interface Args {
  prompt: string;
  grammar: string | null;
  callback?: Callback;
}

interface Deps {
  tokenizer: Tokenizer;
  vocabTrie: VocabTrie;
}

export type ParseInputTokens = (input_tokens: number[]) => BigInt64Array;
export class GrammarLogitsProcessor {
  tokenizer: Tokenizer;
  vocabTrie: VocabTrie;
  prompt: string;
  grammar: string | null;
  parseState?: ParseState;
  constructor({
    prompt,
    grammar,
  }: Args, {
    vocabTrie,
    tokenizer,
  }: Deps) {
    this.vocabTrie = vocabTrie;
    this.tokenizer = tokenizer;
    this.prompt = prompt;
    this.grammar = grammar;
    this.parseState = GBNF(this.grammar);
  }

  getAllowedTokenIds(generated: string) {
    if (generated.length > 0) {
      this.parseState = this.parseState.add(generated[generated.length - 1]);
    }

    const tokens = new Set<Token>();
    // console.log([...this.parseState,]);
    for (const rule of this.parseState) {
      const _tokens = this.vocabTrie.getTokens([rule,]);
      // if (!_tokens.length) {
      //   console.warn(`No tokens found for rule: ${JSON.stringify(rule)}`);
      // }
      for (const token of _tokens) {
        tokens.add(token);
      }
    }
    if (tokens.size === 0) {
      // console.error('No tokens found for any rule in parse state.');
      throw new Error('No tokens found for any rule in parse state.');
    }
    // console.log('acceptable tokens', tokens.map(({ token, }) => token), tokens.map(({ id, }) => id));

    const acceptableTokenIds = Array.from(tokens).map(({ id, }) => id);
    return acceptableTokenIds;
  }

  processors = [(inputTokens: number[], logits: Tensor<Float32Array>) => {
    const decoded = this.tokenizer.decode(inputTokens);
    const generated = decoded.slice(this.prompt.length);

    const allowedTokenIds = this.getAllowedTokenIds(generated);
    return maskLogits(logits, allowedTokenIds);
  },];

  [Symbol.iterator]() {
    return this.processors.values();
  }
}
