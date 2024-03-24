import { parseChunk } from './llama-cpp-llm.js';

describe('LlamaCppLLM', () => {
  describe('parseChunk', () => {
    test('should return the chunk', () => {
      expect(parseChunk('data: { "foo": "bar" }')).toBe(' { "foo": "bar" }');
    });
  });
});
