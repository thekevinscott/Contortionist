import { vi } from 'vitest';
import { isProtocol } from '../type-guards.js';
import * as _typeGuards from '../type-guards.js';

vi.mock('../type-guards.js', async () => {
  return {
    isProtocol: vi.fn().mockReturnValue(false),
    isTransformersJSModelDefinition: vi.fn().mockReturnValue(false),
    isWebLLMModelDefinition: vi.fn().mockReturnValue(false),
  };
});
import { getLLM } from './get-llm.js';
import {
  LlamaCPPLLM,
} from "./llms.js";
import * as _LLMS from './llms.js';

vi.mock('./llms.js', async () => {
  return {
    LlamaCPPLLM: vi.fn(),
    LlamafileLLM: vi.fn(),
    TransformersJSLLM: vi.fn(),
    WebLLM: vi.fn(),
  };
});

describe('getLLM', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('it returns a LlamaCPPLLM for llama.cpp', async () => {
    vi.mocked(isProtocol).mockImplementation((key: string, model: unknown) => {
      return key === 'llama.cpp';
    });
    class MockLlamaCPPLLM { }
    vi.mocked(LlamaCPPLLM).mockImplementation(() => {
      return new MockLlamaCPPLLM() as LlamaCPPLLM;
    });
    const llm = await getLLM({
      protocol: 'llama.cpp',
      endpoint: 'foo',
    });
    expect(llm instanceof MockLlamaCPPLLM).toBe(true);
  });

  test.each([
    {
      protocol: 'foo',
      endpoint: 'foo',
    },
  ])('it throws if any other protocol or model definition is provided', (modelProtocol) => {
    expect(() => getLLM(modelProtocol as any)).rejects.toThrow();
  });
});
