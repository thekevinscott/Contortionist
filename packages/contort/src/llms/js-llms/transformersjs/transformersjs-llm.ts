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
  TransformersJSOpts,
  TokenizeFn,
  TransformersJSExecuteOptions,
} from "./types.js";
import { GrammarParser, } from "../../../utils/grammar-parser/index.js";
import { GetToken, } from "../../../utils/grammar-parser/types.js";

// export const DEFAULT_TEMPERATURE = 0.5;
export const DEFAULT_TEMPERATURE = 0.0;

// type ByteLevelDecoder = PreTrainedTokenizer['decoder'] & {
//   byte_decoder: Record<string, string>;
// };

export class TransformersJSLLM {
  grammarParser: GrammarParser;
  constructor(public pipeline: TextGenerationPipeline) {
    const tokenizer = pipeline.tokenizer as PreTrainedTokenizer;
    const stopTokenId = tokenizer.model.convert_tokens_to_ids([tokenizer.getToken('eos_token'),])[0];
    const vocabSize = tokenizer.model.vocab.length;
    // const decoder = tokenizer.decoder as ByteLevelDecoder;
    // const getDecodedByteForChar: GetDecodedByteForChar = (_char: string) => {
    //   const char = _char === ' ' ? 'Ġ' : _char;
    //   const decodedByte = decoder.byte_decoder[char];
    //   if (decodedByte === undefined) {
    //     throw new Error(`Could not find decoded byte for char: "${char}"`);
    //   }
    //   return parseInt(decodedByte, 10);
    // };
    const getToken: GetToken = tokenId => {
      // const token = tokenizer.model.vocab[tokenId];
      const token = tokenizer.decode([tokenId,]);
      // console.log(tokenId, token, tokenizer.decode([tokenId,]));
      return token;
    };

    this.grammarParser = new GrammarParser({
      vocabSize,
      stopTokenId,
      getToken,
      // getDecodedByteForChar,
    });
  };

  async execute({
    prompt,
    grammar,
    callback,
    llmOpts = {},
    // signal,
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
    const generate_kwargs: TransformersJSOpts = {
      temperature: DEFAULT_TEMPERATURE,
      ...llmOpts,

      callback_function: callbackFunction,
    };

    if (grammar) {
      this.grammarParser.initialize(grammar);
    }
    const logitsProcessor = grammar ? new GrammarLogitsProcessor(prompt, this.grammarParser, tokenizer) : undefined;
    const { input_ids, attention_mask, } = (tokenizer as TokenizeFn)(prompt);

    // The type definitions for Transformers.js objects appear as anys, which get reported as bugs
    const model = this.pipeline.model as PreTrainedModel;

    const outputTokenIds = await (model.generate as GenerateFn)(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
    const decoded = tokenizer.decode(outputTokenIds[0]);
    return decoded;
  };
};

