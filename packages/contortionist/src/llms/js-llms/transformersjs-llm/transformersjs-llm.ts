import { Tensor, TextGenerationConfig, TextGenerationPipeline, } from "@xenova/transformers";
import { AbstractLLM, } from "../../abstract-llm.js";
import { Tokenizer, } from "./tokenizer.js";
import { InternalExecuteOptions, OutputTokenIds, } from "../../../types.js";
import { LogitsProcessor, } from "./logits-processor.js";

interface Objects {
  pipeline: TextGenerationPipeline;
  tokenizer: Tokenizer;
  // parser: AbstractParser;
}
interface TransformersJSResponse {
  input_tokens: OutputTokenIds;
  logits: Tensor;
}

export class TransformersJSLLM implements AbstractLLM {
  objects: Promise<Objects>;

  constructor(model: TextGenerationPipeline | Promise<TextGenerationPipeline>) {
    this.objects = this.initialize(model);
  };

  initialize = async (_model: TextGenerationPipeline | Promise<TextGenerationPipeline>): Promise<Objects> => {
    const model = await _model;
    const tokenizer = new Tokenizer(model);

    return {
      pipeline: model,
      tokenizer,
    };
  };

  execute = async ({ n, streamCallback, prompt, ...opts }: InternalExecuteOptions<TransformersJSResponse>) => {
    // execute: Execute = async (prompt: string, { maxTokens = 1 }: { maxTokens?: number } = {}) => {
    console.log(`execute: ${prompt}`);
    const {
      tokenizer,
      pipeline,
    } = await this.objects;
    const generate_kwargs: TextGenerationConfig = {
      temperature: 0.5,
      ...opts,
      // ...config,
      max_new_tokens: n,
    };
    const logitsProcessor = new LogitsProcessor(tokenizer, streamCallback);
    const { input_ids, attention_mask, } = await tokenizer.encode(prompt);
    const outputTokenIds = await pipeline.model.generate(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
    const decoded = tokenizer.decode(outputTokenIds);
    return decoded[0];
    // const parser = getParser(tokenizer, 'lark');
    // let partialCompletion = '';
    // let promptAndPartialCompletion = `${prompt}${partialCompletion}`;
    // for (let i = 0; i < maxTokens; i++) {
    //   // console.log('i', i, 'out of', maxTokens);
    //   let start = performance.now();
    //   await parser.nextLex({
    //     prompt,
    //     partialCompletion,
    //   });
    //   console.log('next lex', performance.now() - start);
    //   start = performance.now();
    //   if (!parser.shouldContinue) {
    //     console.log(`do not continue, processed ${i} tokens`)
    //     break;
    //   }
    //   console.log('should continue', performance.now() - start);

    //   // console.log(`promptAndPartialCompletion: ${promptAndPartialCompletion}`)
    //   start = performance.now();
    //   const { input_ids, attention_mask } = await tokenizer.encode(promptAndPartialCompletion);
    //   console.log('tokenizer encode', performance.now() - start);
    //   if (input_ids.size === 0) {
    //     throw new Error(`Got empty input_ids for "${promptAndPartialCompletion}"`);
    //   }

    //   // partialCompletion = await llm.generateText(promptAndPartialCompletion, logitsProcessor);
    //   start = performance.now();
    //   const generate_kwargs: TextGenerationConfig = {
    //     temperature: 0.5,
    //     // ...config,
    //     max_new_tokens: 3,
    //   };
    //   const outputTokenIds = await pipeline.model.generate(input_ids, generate_kwargs, logitsProcessor, {
    //     inputs_attention_mask: attention_mask
    //   });
    //   console.log('generate text', performance.now() - start);
    //   start = performance.now();
    //   const decoded = tokenizer.decode(outputTokenIds);
    //   console.log('tokenizer decode', performance.now() - start);
    //   // console.log(`decoded: ${decoded}`)
    //   partialCompletion = decoded[0].slice(prompt.length);
    //   console.log(`partialCompletion: ${partialCompletion}`)
    //   promptAndPartialCompletion = `${prompt}${partialCompletion}`;
    //   // promptAndPartialCompletion += partialCompletion;
    //   // `${prompt}${partialCompletion}`;
    //   // console.log(`promptAndPartialCompletion: ${promptAndPartialCompletion}`)
    // }
    // console.log('returning', promptAndPartialCompletion)
    // return promptAndPartialCompletion;
  };
}
