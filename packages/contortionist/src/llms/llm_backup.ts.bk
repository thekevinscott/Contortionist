

// import OpenAI from 'openai';
// import { LogitsProcessor } from './logits-processor';

// const openai = new OpenAI({
//   apiKey: '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',
//   dangerouslyAllowBrowser: true,
// });


// export class LLM {
//   // apipeline: Promise<TextGenerationPipeline>;
//   // tokenizer: Tokenizer;
//   ready: Promise<void>;
//   constructor(model: string, progressCallback?: any) {
//     // this.apipeline = pipeline('text-generation', model, {
//     //   progress_callback: progressCallback,
//     // });
//     this.ready = this.initialize();
//   }

//   initialize = async () => {

//   };

//   async generateText(prompt: string, logitsProcessor: LogitsProcessor = null): Promise<string> {
//     // const allowedTokenIds = logitsProcessor.parser.getAllowedTokens();
//     // console.log('allowedTokenIds', allowedTokenIds)
//     // this.parser.getAllowedTokens(input_tokens, logits)
//     console.log('prompt', prompt)
//     const { choices: [choice] } = await openai.chat.completions.create({
//       messages: [{ role: 'user', content: prompt }],
//       model: 'gpt-3.5-turbo',
//       max_tokens: 1,
//       logprobs: true,
//       top_logprobs: 20,

//       // logit_bias: { '0': 100 },
//       // logit_bias: allowedTokenIds.slice(0, 300).reduce((obj, tokenId) => ({
//       //   ...obj,
//       //   [tokenId]: 100,
//       // }), {}),
//     });
//     const logProbs = choice.logprobs.content[0].top_logprobs;
//     // console.log(logProbs)
//     return logitsProcessor.process(logProbs);
//     // const { logprobs: { content } } = choice;
//     // console.log(content)
//     // // console.log(chatCompletion);
//     // return content;
//     // return choice.message.content
//     //   if (input_ids.size === 0) {
//     //     throw new Error(`input_ids must be non-empty`);
//     //   }
//     //   const pipeline = await this.apipeline;
//     //   const generate_kwargs: TextGenerationConfig = {
//     //     temperature: 0.5,
//     //     ...config,
//     //     max_new_tokens: 1,
//     //   };
//     //   return pipeline.model.generate(input_ids, generate_kwargs, logitsProcessor, {
//     //     inputs_attention_mask: attention_mask
//     //   });
//   }
// }



import { pipeline, env, TextGenerationConfig, PreTrainedTokenizer, TextGenerationPipeline, Tensor, } from '@xenova/transformers';
import { GenerationOutput, OutputTokenIds, } from '../types.js';
import { Tokenizer, } from './js-llms/transformersjs-llm/tokenizer.js';

env.allowRemoteModels = true;
env.allowLocalModels = false;

export class LLM {
  apipeline: Promise<TextGenerationPipeline>;
  tokenizer: Tokenizer;
  constructor(model: string, progressCallback?: any) {
    this.apipeline = this.initialize(model, progressCallback);
  }

  initialize = (model: string, progressCallback?: any) => pipeline('text-generation', model, {
    progress_callback: progressCallback,
  });

  async generateText({ input_ids, attention_mask, }: GenerationOutput, config: TextGenerationConfig, logitsProcessor: any = null): Promise<number[][]> {
    if (input_ids.size === 0) {
      throw new Error(`input_ids must be non-empty`);
    }
    const generate_kwargs: TextGenerationConfig = {
      temperature: 0.5,
      ...config,
      max_new_tokens: 3,
    };
    const pipeline = await this.apipeline;
    return pipeline.model.generate(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
  }
}
