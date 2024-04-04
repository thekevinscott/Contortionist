import { getLLM } from "./get-llm.js";
import { LlamaCPPLLM } from "./endpoint-llms/llama-cpp/llama-cpp-llm.js";

describe('getLLM', () => {
  test('it returns a LlamaCPPLLM for llama.cpp', async () => {
    const llm = await getLLM({
      protocol: 'llama.cpp',
      endpoint: 'foo',
    });
    expect(llm instanceof LlamaCPPLLM).toBe(true);
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
