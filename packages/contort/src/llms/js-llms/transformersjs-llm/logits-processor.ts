import { Tokenizer, } from "./tokenizer.js";
import GBNF, { ParseState, } from 'gbnf';
import { Token, VocabTrie, } from "./vocab-trie.js";
import { Callback, Tensor, } from "./types.js";

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
export class LogitsProcessor {
  tokenizer: Tokenizer;
  vocabTrie: VocabTrie;
  callback?: Callback;
  prompt: string;
  grammar: string | null;
  parseState?: ParseState;
  constructor({
    callback,
    prompt,
    grammar,
  }: Args, {
    vocabTrie,
    tokenizer,
  }: Deps) {
    this.vocabTrie = vocabTrie;
    this.tokenizer = tokenizer;
    this.callback = callback;
    this.prompt = prompt;
    this.grammar = grammar;
    if (this.grammar) {
      this.parseState = GBNF(this.grammar);
    }
  }

  partialLen = 0;
  processors = [(inputTokens: number[], logits: Tensor) => {
    // console.log(
    //   'inputTokens',
    //   inputTokens,
    //   inputTokens.map((id) => this.tokenizer.decode([id,])),
    // );
    if (this.callback) {
      const decoded = this.tokenizer.decode(inputTokens);
      this.callback({
        partial: decoded,
        chunk: {
          inputTokens: inputTokens,
          logits,
        },
      });
    }

    if (this.parseState) {
      const decoded = this.tokenizer.decode(inputTokens);
      const generated = decoded.slice(this.prompt.length + this.partialLen);
      this.partialLen = decoded.slice(this.prompt.length).length;

      if (generated !== '') {
        this.parseState = this.parseState.add(generated);
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
      // const data = logits.data as Float32Array;
      const data = logits.data as unknown as Float32Array;
      const originalValues = new Map<number, number>();
      for (const tokenId of acceptableTokenIds) {
        originalValues.set(tokenId, data[tokenId]);
      }
      data.fill(-Infinity);
      for (const [tokenId, value,] of originalValues) {
        data[tokenId] = value;
      }
      // console.log(originalValues);
      // console.log('data', data);
      return {
        ...logits,
        data,
      };
    }

    return logits;
  },];

  [Symbol.iterator]() {
    return this.processors.values();
  }
}
