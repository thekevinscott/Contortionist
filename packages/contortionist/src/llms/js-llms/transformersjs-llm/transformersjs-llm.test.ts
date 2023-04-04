import { vi } from 'vitest';
import { TransformersJSLLM } from "./transformersjs-llm.js";
import { Tokenizer, } from "./tokenizer.js";
import * as _LogitsProcessor from "./logits-processor.js";
import * as _Tokenizer from "./tokenizer.js";
import * as _VocabTrie from "./vocab-trie.js";
import { makeMockTextGenerationPipeline } from './__fixtures__/mock-pipeline.js';
import { makeMockVocabTrie } from './__fixtures__/mock-vocab-trie.js';
import { makeMockTokenizer } from './__fixtures__/mock-tokenizer.js';
import { MockPretrainedTokenizerArgs } from './__fixtures__/mock-pretrained-tokenizer.js';

vi.mock("./logits-processor.js", async () => {
  const actual = await vi.importActual("./logits-processor.js") as typeof _LogitsProcessor;
  return {
    ...actual,
    LogitsProcessor: vi.fn(),
  };
});

vi.mock("./tokenizer.js", async () => {
  const actual = await vi.importActual("./tokenizer.js") as typeof _Tokenizer;
  class MockTokenizer {
    decode = vi.fn().mockImplementation(() => ['bar']);
    encode = vi.fn().mockImplementation(() => ({
      input_ids: { data: [0] },
      attention_mask: { data: [1] },
    }));
  }
  return {
    ...actual,
    Tokenizer: MockTokenizer,
  };
});

vi.mock("./vocab-trie.js", async () => {
  const actual = await vi.importActual("./vocab-trie.js") as typeof _VocabTrie;
  class MockVocabTrie {
    constructor() {
      return makeMockVocabTrie();
    }
  }
  return {
    ...actual,
    VocabTrie: MockVocabTrie,
  };
});

describe('TransformersJSLLM', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it initializes', () => {
    const mockPipeline = makeMockTextGenerationPipeline();
    const llm = new TransformersJSLLM(mockPipeline);
    expect(llm.pipeline).toBe(mockPipeline);
  });

  test.only('it executes', async () => {

    // vi.spyOn(Tokenizer.prototype, 'decode').mockImplementation(() => ['bar'])
    // Tokenizer.prototype.decode = vi.fn().mockImplementation(() => ['bar']);
    const mockPipeline = makeMockTextGenerationPipeline();

    const llm = new TransformersJSLLM(mockPipeline);
    const result = await llm.execute({
      prompt: 'foo',
      n: 10,
      callback: () => { },
      signal: null as unknown as AbortSignal,
    });
    // expect(mock).toHaveBeenCalledWith([0]);
    expect(result).toBe('bar');

  });
});
