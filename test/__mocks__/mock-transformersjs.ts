import { PreTrainedModel } from '@xenova/transformers';
import { PreTrainedTokenizer } from '@xenova/transformers';
import { TextGenerationPipeline } from '@xenova/transformers';

import { vi } from 'vitest';

class Callable extends Function {
  constructor() {
    super();
    var closure = function (...args) { return closure._call(...args) }
    return Object.setPrototypeOf(closure, new.target.prototype)
  }

  _call = vi.fn();
}

class MockTensor {
  data: number[];
  dims: number[];

  constructor(arr: number[][]) {
    this.data = arr.flat();
    this.dims = [arr.length, arr[0].length];
  }
}

const tokenToNumber = new Map<string, number>();
const numberToToken = new Map<number, string>();
class MockPretrainedTokenizer extends Callable {
  special_tokens = ['<|endoftext|>'];

  _call = vi.fn().mockImplementation((token: string) => {
    if (!tokenToNumber.has(token)) {
      tokenToNumber.set(token, tokenToNumber.size);
    }
    const tokenId = tokenToNumber.get(token);
    numberToToken.set(tokenId, token);
    return {
      input_ids: new MockTensor([[tokenId]]),
    }
  });

  decode = vi.fn().mockImplementation((tokenIds: number[]) => {
    // console.log(tokenIds)
    return [tokenIds.map((tokenId) => numberToToken.get(tokenId)).join('')];
  });

  model = {
    vocab: [],
  }
}

class MockPretrainedModel extends Callable {
  constructor(content: string) {
    super();
    this.content = content;
  }

  content: string;


  generate = vi.fn().mockImplementation(({ data, dims }: MockTensor, args: any) => {
    // const randomTokenId = Math.floor(Math.random() * tokenToNumber.size);
    // const randomTokenId = 1000;
    // return new MockTensor([[...data, randomTokenId]]).data;
    const tokensToReturn = this.content.split('').map(char => tokenToNumber.get(char));
    return new MockTensor([tokensToReturn]).data;
  });
}

export class MockPipeline {
  tokenizer: MockPretrainedTokenizer;
  model: PreTrainedModel;
  constructor(content: string, vocab: string[]) {
    this.tokenizer = new MockPretrainedTokenizer() as unknown as PreTrainedTokenizer;
    this.tokenizer.model.vocab = vocab;
    this.model = new MockPretrainedModel(content) as unknown as PreTrainedModel;
  }
}

export const makeMockPipeline = (content: string, vocab: string[]) => {
  return new MockPipeline(content, vocab) as unknown as TextGenerationPipeline;
}
