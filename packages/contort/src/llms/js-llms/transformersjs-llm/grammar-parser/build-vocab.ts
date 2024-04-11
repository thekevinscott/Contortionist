import type {
  PreTrainedTokenizer,
  TextGenerationPipeline,
} from "@xenova/transformers";
import { type Vocab, } from "./types.js";
import { BidirectionalMap, } from "./bidirectional-map.js";

export const buildVocab = (pipeline: TextGenerationPipeline): BidirectionalMap<number, string> => {
  const vocab: Vocab = new BidirectionalMap();
  const tokenizer = pipeline.tokenizer as PreTrainedTokenizer;
  for (let tokenId = 0; tokenId < tokenizer.model.vocab.length; tokenId++) {
    // vocab.set(tokenId, tokenizer.decode([tokenId,]));
    vocab.set(tokenId, tokenizer.model.vocab[tokenId]);
  }
  return vocab;
};
