import type {
  PreTrainedTokenizer,
  TextGenerationPipeline,
} from '@xenova/transformers';
import type { GenerationOutput, TokenizeFn, } from './types.js';

export const DEFAULT_TOKENIZE_ARGS = {
  add_special_tokens: false,
  padding: true,
  truncation: true,
};

export class Tokenizer {
  // tokenizerArgs: {
  //   add_special_tokens: boolean;
  //   padding: boolean;
  //   truncation: boolean;
  // };
  pipeline: TextGenerationPipeline;
  #stopToken?: string;
  #stopTokenId?: number;

  constructor(
    pipeline: TextGenerationPipeline,
    // add_special_tokens: boolean = false,
  ) {
    this.pipeline = pipeline;
    this.tokenizer.padding_side = 'left';
    // this.tokenizerArgs = {
    //   add_special_tokens,
    //   padding: true,
    //   truncation: true,
    // };

    // this.initialize();
  }

  get tokenizer(): PreTrainedTokenizer {
    return this.pipeline.tokenizer;
  }

  encode: TokenizeFn = (prompt, args = {}): GenerationOutput => {
    return (this.tokenizer as TokenizeFn)(prompt, {
      ...DEFAULT_TOKENIZE_ARGS,
      ...args,
    });
  };

  getEncodingId = (char: string): number => {
    const { input_ids: { data, dims, }, } = this.encode(char);
    if (dims[0] !== 1 || dims[1] !== 1) {
      throw new Error(`Expected a single item tensor, got: ${JSON.stringify(dims)} for char ${char}`);
    }
    return Number(data[0]);
  };

  decode = (tokenIds: number[][] | number[] | BigInt64Array): string => {
    if (Array.isArray(tokenIds) && tokenIds.length > 0 && Array.isArray(tokenIds[0]) && typeof tokenIds[0][0] === 'number') {
      return (this.tokenizer.batch_decode)(tokenIds, {
        skip_special_tokens: true,
      })[0];
    }
    if (Array.isArray(tokenIds) && tokenIds.length > 0 && typeof tokenIds[0] === 'number') {
      return this.tokenizer.decode(tokenIds, {
        skip_special_tokens: true,
      });
    }
    if (tokenIds instanceof BigInt64Array && tokenIds.length > 0) {
      const tokenIdsArray = Array.from(tokenIds).map(t => Number(t.toString()));
      return this.tokenizer.decode(tokenIdsArray, {
        skip_special_tokens: true,
      });
    }
    throw new Error(`Invalid tokenIds: ${JSON.stringify(tokenIds)}`);
  };

  get stopToken(): string {
    if (this.#stopToken === undefined) {
      const stopToken = (this.tokenizer.special_tokens as unknown[])[0];
      if (!isString(stopToken)) {
        throw new Error(`Special token is not a string: ${JSON.stringify(stopToken)}`);
      }
      this.#stopToken = stopToken;
    }
    return this.#stopToken;
  }

  get stopTokenId(): number {
    if (this.#stopTokenId === undefined) {
      this.#stopTokenId = this.getEncodingId(this.stopToken);
    }
    return this.#stopTokenId;
  }
}

export const isString = (text: unknown): text is string => typeof text === 'string';
