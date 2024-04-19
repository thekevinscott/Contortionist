/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type {
  PreTrainedModel,
  PreTrainedTokenizer,
  TextGenerationPipeline,
} from "@xenova/transformers";
import { GrammarLogitsProcessor, } from "./grammar-logits-processor.js";
import type {
  Beam,
  GenerateFn,
  TokenizeFn,
  TransformersJSExecuteOptions,
} from "./types.js";
import { GrammarParser, } from "./grammar-parser/index.js";

// export const DEFAULT_TEMPERATURE = 0.5;
export const DEFAULT_TEMPERATURE = 0.0;


export class TransformersJSLLM {
  grammarParser: GrammarParser;
  constructor(public pipeline: TextGenerationPipeline) {
    this.grammarParser = new GrammarParser(this.pipeline);
  };

  async execute({
    prompt,
    grammar,
    callback,
    // signal,
    ...rest
  }: TransformersJSExecuteOptions) {
    const tokenizer = this.pipeline.tokenizer as PreTrainedTokenizer;
    const callbackFunction = callback ? (beams: Beam[]) => {
      for (const beam of beams) {
        const outputTokenIds = beam.output_token_ids;
        const decoded = tokenizer.decode(outputTokenIds);
        callback({
          partial: decoded,
          chunk: beam,
        });
      }
    } : undefined;
    const generate_kwargs = {
      temperature: DEFAULT_TEMPERATURE,
      ...rest,

      callback_function: callbackFunction,
      // num_beams: 5,
      // no_repeat_ngram_size: 2,
      // early_stopping: true,
    };

    if (grammar) {
      this.grammarParser.initialize(grammar);
    }
    const logitsProcessor = grammar ? new GrammarLogitsProcessor(prompt, this.grammarParser, tokenizer) : undefined;
    const { input_ids, attention_mask, } = (tokenizer as TokenizeFn)(prompt);

    // The type definitions for Transformers.js objects appear as anys, which get reported as bugs
    const model = this.pipeline.model as PreTrainedModel;

    // console.log('starting', input_ids.data, attention_mask.data);
    const outputTokenIds = await (model.generate as GenerateFn)(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
    const decoded = tokenizer.decode(outputTokenIds[0]);
    return decoded[0];
  };
};

