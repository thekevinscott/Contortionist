/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { PreTrainedModel, TextGenerationConfig, TextGenerationPipeline, } from "@xenova/transformers";
import { LogitsProcessor, } from "./logits-processor.js";
import { Tokenizer, } from "./tokenizer.js";
import type { GenerateFn, TransformersJSExecuteOptions, } from "./types.js";
import { VocabTrie, } from "./vocab-trie.js";

export const DEFAULT_TEMPERATURE = 0.5;

export class TransformersJSLLM {
  pipeline: TextGenerationPipeline;
  tokenizer: Tokenizer;
  vocabTrie: VocabTrie;

  constructor(pipeline: TextGenerationPipeline) {
    this.pipeline = pipeline;
    this.tokenizer = new Tokenizer(pipeline);
    this.vocabTrie = new VocabTrie(this.tokenizer);
    this.vocabTrie.initialize();
  };

  async execute({
    prompt,
    n,
    grammar,
    callback,
    // signal,
  }: TransformersJSExecuteOptions) {
    const generate_kwargs: TextGenerationConfig = {
      temperature: DEFAULT_TEMPERATURE,
      // ...opts,
      max_new_tokens: n,
    };

    const logitsProcessor = new LogitsProcessor({
      prompt,
      grammar,
      callback,
    }, {
      tokenizer: this.tokenizer,
      vocabTrie: this.vocabTrie,
    });
    const { input_ids, attention_mask, } = this.tokenizer.encode(prompt);

    // The type definitions for Transformers.js objects appear as anys, which get reported as bugs
    const model = this.pipeline.model as PreTrainedModel;

    const outputTokenIds = await (model.generate as GenerateFn)(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
    const decoded = this.tokenizer.decode(outputTokenIds);
    return decoded[0];
  };
};

