import type { ParseState, } from "gbnf";
import type {
  Vocab,
} from "../types.js";
import type { PreTrainedTokenizer, } from "@xenova/transformers";
import type { TextGenerationPipeline, } from "@xenova/transformers";
import { TrieNode, } from "./trie-node.js";

export class Trie {
  root: TrieNode;
  vocab: Vocab;
  constructor(vocab: Vocab, stopTokenId: number, pipeline: TextGenerationPipeline) {
    this.vocab = vocab;
    this.root = new TrieNode(stopTokenId);
    const tokenizer = pipeline.tokenizer as PreTrainedTokenizer;
    for (let tokenId = 0; tokenId < tokenizer.model.vocab.length; tokenId++) {
      this.root.add(tokenizer, tokenId);
    }
  }

  getTokens = (state: ParseState, maximumDepth?: number) => {
    const tokenIds = this.root.getTokens(state, { maximumDepth, });
    if (tokenIds.size === 0) {
      throw new Error('Grammar is incorrect; no rule was found.');
      // return new Set([this.root.stopTokenId,]);
    }
    return tokenIds;
  };
}
