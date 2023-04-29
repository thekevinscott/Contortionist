import type {
  WebLLMExecuteOptions,
  Tokenizer,
  WebLLMModelDefinition,
  LogitProcessorRegistry,
} from "./types.js";
import { GrammarLogitsProcessor, } from "./grammar-logits-processor.js";
import type {
  GetToken,
} from "../../../utils/grammar-parser/types.js";
import { GrammarParser, } from "../../../utils/grammar-parser/grammar-parser.js";

// export const DEFAULT_TEMPERATURE = 0.5;
export const DEFAULT_TEMPERATURE = 0.0;


export class WebLLM {
  grammarParser: GrammarParser;
  logitProcessorRegistry: LogitProcessorRegistry = new Map();
  constructor(public engine: WebLLMModelDefinition) {
    // console.log('config', engine.config.conv_template.stop_token_ids);
    const tokenizer = engine.pipeline.tokenizer;
    // const getDecodedByteForChar: GetDecodedByteForChar = (char: string) => {
    //   return char.codePointAt(0);
    //   // // const tokenStr = tokenizer.decode(new Int32Array([30,]));
    //   // // console.log(tokenStr);
    //   // const bytes: Array<number> = Array.from(textEncoder.encode(char));
    //   // return bytes[0];
    //   // console.log(bytes);
    //   //   const decodedByte = decoder.byte_decoder[char];
    //   //   if (decodedByte === undefined) {
    //   //     throw new Error(`Could not find decoded byte for ${char}`);
    //   //   }
    //   //   return parseInt(decodedByte, 10);
    // };

    // const getDecodedByteForChar: GetDecodedByteForChar = (char: string) => {
    //   // console.log('char', char);
    //   return char.codePointAt(0);
    // };
    const getToken: GetToken = tokenId => {
      return tokenizer.decode(new Int32Array([tokenId,]));
      // return tokenizer.idToToken(tokenId);
    };
    const stopTokenId = engine.config.conv_template.stop_token_ids[0];

    this.grammarParser = new GrammarParser({
      vocabSize: tokenizer.getVocabSize(),
      // vocabSize: 25,
      stopTokenId,
      getToken,
      // getDecodedByteForChar,
    });
  };

  async execute({
    prompt,
    grammar,
    callback,
    signal,
    ...rest
  }: WebLLMExecuteOptions) {
    const engine = this.engine;
    // const stopTokenId = engine.config.conv_template.stop_token_ids[0];
    if (grammar) {
      this.grammarParser.initialize(grammar);
      const logitsProcessor = new GrammarLogitsProcessor(
        prompt,
        this.grammarParser,
      );
      const currentModelId = engine.currentModelId;
      this.logitProcessorRegistry.set(currentModelId, logitsProcessor);
      engine.setLogitProcessorRegistry(this.logitProcessorRegistry);
      await engine.reload(currentModelId);
      logitsProcessor.tokenizer = engine.pipeline.tokenizer as Tokenizer;
    } else {
      const currentModelId = (engine as unknown as { currentModelId: string }).currentModelId;
      this.logitProcessorRegistry.set(currentModelId, undefined);
      engine.setLogitProcessorRegistry(this.logitProcessorRegistry);
      await engine.reload(currentModelId);
    }
    // const tokenizer = engine.pipeline.tokenizer as Tokenizer;


    engine.chat.completions.create;
    const asyncChunkGenerator = await engine.chat.completions.create({
      ...rest,
      stream: true,
      messages: [
        { "role": "user", "content": prompt, },
      ],
    });

    let partial = "";
    if (callback) {
      for await (const chunk of asyncChunkGenerator) {
        if (chunk.choices[0].delta.content) {
          // Last chunk has undefined content
          partial += chunk.choices[0].delta.content;
        }
        callback({ chunk, partial, });
        if (signal.aborted) {
          await engine.interruptGenerate();
        }
      }
    }


    // let fullString = prompt;
    // let nextToken = [...tokenizer.encode(prompt),];

    // let counter = 0;
    // while (counter < 20) {
    //   counter += 1;
    //   nextToken = [await engine.forwardTokensAndSample(nextToken, false),];
    //   if (nextToken[0] === stopTokenId) {
    //     break;
    //   }
    //   const decodedToken = tokenizer.decode(new Int32Array(nextToken));
    //   fullString += decodedToken;
    // }

    // return fullString;
  };
};


