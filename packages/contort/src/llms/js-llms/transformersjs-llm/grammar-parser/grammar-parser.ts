import type {
  PreTrainedTokenizer,
  TextGenerationPipeline,
} from "@xenova/transformers";
import { Grammar, } from "../../../../types.js";
import { buildVocab, } from "./build-vocab.js";
import { Trie, } from "./trie/trie.js";
import GBNF, { ParseState, } from "gbnf";
import type { Vocab, } from "./types.js";

export type GetNextTokenIds = () => Set<number>;
export type AddToken = (token: string) => void;

export class GrammarParser {
  pipeline: TextGenerationPipeline;
  trie: Trie;
  #parseState: ParseState;
  vocab: Vocab;
  constructor(pipeline: TextGenerationPipeline) {
    this.pipeline = pipeline;
    const tokenizer = pipeline.tokenizer as PreTrainedTokenizer;
    this.vocab = buildVocab(this.pipeline);
    this.trie = new Trie(
      this.vocab,
      tokenizer.model.tokens_to_ids.get(tokenizer.getToken('eos_token')),
      this.pipeline,
    );
  }

  get parseState() {
    if (!this.#parseState) {
      throw new Error('GrammarParser not initialized');
    }
    return this.#parseState;
  }
  set parseState(parseState: ParseState) { this.#parseState = parseState; }

  initialize = (grammar: Grammar) => this.parseState = GBNF(grammar);
  addToken: AddToken = (token) => this.parseState = this.parseState.add(token);
  getNextTokenIds: GetNextTokenIds = () => this.trie.getTokens(this.parseState, 1);
}
