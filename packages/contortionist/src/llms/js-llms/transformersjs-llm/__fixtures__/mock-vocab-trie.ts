import { vi } from 'vitest';
import { VocabTrie } from '../vocab-trie.js';

export interface MockVocabTrieArgs {
  getTokens?: VocabTrie['getTokens'];
}

export const makeMockVocabTrie = ({
  getTokens = vi.fn(),
}: MockVocabTrieArgs = {}): VocabTrie => {
  class MockVocabTrie {
    getTokens = getTokens;
    initialize = vi.fn();
  }
  return new MockVocabTrie() as unknown as VocabTrie;
};
