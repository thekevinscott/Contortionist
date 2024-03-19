import { TextGenerationConfig, TextGenerationPipeline } from "@xenova/transformers";
import { AbstractLLM, Execute } from "../../abstract-llm.js";
import { Tokenizer } from "./tokenizer.js";
import { LogitsProcessor } from "./logits-processor.js";
import { getParser } from "./parsers/get-parser.js";

interface Objects {
  pipeline: TextGenerationPipeline;
  tokenizer: Tokenizer;
  // parser: AbstractParser;
}

export class TransformersJSLLM implements AbstractLLM {
  objects: Promise<Objects>;

  constructor(model: TextGenerationPipeline | Promise<TextGenerationPipeline>) {
    this.objects = this.initialize(model);
  };

  initialize = async (_model: TextGenerationPipeline | Promise<TextGenerationPipeline>): Promise<Objects> => {
    const model = await _model;
    // const llm = await pipeline('text-generation', model, {
    //   // progress_callback: progressCallback,
    // });
    // const tokenizer = new Tokenizer(llm);
    const tokenizer = new Tokenizer(model);

    return {
      pipeline: model,
      tokenizer,
    };
  }

  execute: Execute = async (prompt: string, { maxTokens = 1 }: { maxTokens?: number } = {}) => {
    console.log(`execute: ${prompt}`);
    const {
      tokenizer,
      pipeline,
    } = await this.objects;
    const parser = getParser(tokenizer, 'lark');
    const logitsProcessor = new LogitsProcessor(tokenizer, parser);
    let partialCompletion = '';
    let promptAndPartialCompletion = `${prompt}${partialCompletion}`;
    for (let i = 0; i < maxTokens; i++) {
      // console.log('i', i, 'out of', maxTokens);
      let start = performance.now();
      await parser.nextLex({
        prompt,
        partialCompletion,
      });
      console.log('next lex', performance.now() - start);
      start = performance.now();
      if (!parser.shouldContinue) {
        console.log(`do not continue, processed ${i} tokens`)
        break;
      }
      console.log('should continue', performance.now() - start);

      // console.log(`promptAndPartialCompletion: ${promptAndPartialCompletion}`)
      start = performance.now();
      const { input_ids, attention_mask } = await tokenizer.encode(promptAndPartialCompletion);
      console.log('tokenizer encode', performance.now() - start);
      if (input_ids.size === 0) {
        throw new Error(`Got empty input_ids for "${promptAndPartialCompletion}"`);
      }

      // partialCompletion = await llm.generateText(promptAndPartialCompletion, logitsProcessor);
      start = performance.now();
      const generate_kwargs: TextGenerationConfig = {
        temperature: 0.5,
        // ...config,
        max_new_tokens: 3,
      };
      const outputTokenIds = await pipeline.model.generate(input_ids, generate_kwargs, logitsProcessor, {
        inputs_attention_mask: attention_mask
      });
      console.log('generate text', performance.now() - start);
      start = performance.now();
      const decoded = tokenizer.decode(outputTokenIds);
      console.log('tokenizer decode', performance.now() - start);
      // console.log(`decoded: ${decoded}`)
      partialCompletion = decoded[0].slice(prompt.length);
      console.log(`partialCompletion: ${partialCompletion}`)
      promptAndPartialCompletion = `${prompt}${partialCompletion}`;
      // promptAndPartialCompletion += partialCompletion;
      // `${prompt}${partialCompletion}`;
      // console.log(`promptAndPartialCompletion: ${promptAndPartialCompletion}`)
    }
    console.log('returning', promptAndPartialCompletion)
    return promptAndPartialCompletion;
  }
}
