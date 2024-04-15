import { ParseState, } from "gbnf";
import { RuleType, } from "gbnf";

import { iterateOverValue, } from "./iterate-over-value.js";
import type { PreTrainedTokenizer, } from "@xenova/transformers";

export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export class TrieNode {
  #nodes = new Map<number, TrieNode>();
  #childTokenIds = new Set<number>();
  #terminalTokenId?: number;
  char?: string;

  stopTokenId: number;
  constructor(stopTokenId: number, char?: string) {
    this.stopTokenId = stopTokenId;
    this.char = char;
  }

  get = (codePoint: number): TrieNode | undefined => this.#nodes.get(codePoint);
  *getNot(excluded: Set<number>): IterableIterator<TrieNode> {
    for (const [key, value,] of this.#nodes) {
      if (!excluded.has(key)) {
        yield value;
      }
    }
  }

  get size() { return this.#nodes.size; }

  add = (tokenizer: PreTrainedTokenizer, tokenId: number, pos = 0) => {
    const decoder = tokenizer.decoder as ByteLevelDecoder;
    const token = tokenizer.model.vocab[tokenId];
    const decodedCodePoints: number[] = [...token,].map(char => {
      const decodedByte = decoder.byte_decoder[char];
      if (decodedByte === undefined) {
        // return char.codePointAt(0);
        throw new Error(`Could not find decoded byte for ${char}`);
      }
      return parseInt(decodedByte, 10);
    });

    const char = token[pos];
    const decodedCodePoint = decodedCodePoints[pos];
    let node = this.#nodes.get(decodedCodePoint);
    if (!node) {
      node = new TrieNode(this.stopTokenId, char);
      this.#nodes.set(decodedCodePoint, node);
    }

    if (pos === token.length - 1) {
      node.#terminalTokenId = tokenId;
    } else {
      node.#childTokenIds.add(tokenId);
      node.add(tokenizer, tokenId, pos + 1);
    }
  };

  [customInspectSymbol]() {
    const name = this.char === undefined ? 'root' : `"${this.char}"`;
    return JSON.stringify({
      name,
      terminal: this.#terminalTokenId,
      numberOfNodes: this.#nodes.size,
      numberOfTokenIds: this.#childTokenIds.size,
    }, null, 2);
  }

  getTokens = (state: ParseState, {
    tokenIds = new Set(),
    currentDepth = 0,
    maximumDepth,
  }: {
    tokenIds?: Set<number>;
    currentDepth?: number;
    maximumDepth?: number;
  } = {}): Set<number> => {
    if (maximumDepth !== undefined && currentDepth > maximumDepth) {
      return tokenIds;
    }
    for (const rule of state) {
      if (rule.type === RuleType.CHAR) {
        if (this.#terminalTokenId !== undefined) {
          tokenIds.add(this.#terminalTokenId);
        }
        for (const value of rule.value) {
          for (const codePoint of iterateOverValue(value)) {
            const char = String.fromCodePoint(codePoint);
            // const node = this.get(char);
            const node = this.get(codePoint);
            if (node) {
              node.getTokens(state.add(char), { maximumDepth, tokenIds, currentDepth: currentDepth + 1, });
              if (node.#terminalTokenId !== undefined && (maximumDepth === undefined || currentDepth < maximumDepth)) {
                tokenIds.add(node.#terminalTokenId);
              }
            }
          }
        }
      } else if (rule.type === RuleType.CHAR_EXCLUDE) {
        const excluded = new Set<number>();
        for (const value of rule.value) {
          for (const codePoint of iterateOverValue(value)) {
            // const excludedChar = String.fromCodePoint(codePoint);
            // excluded.add(excludedChar);
            excluded.add(codePoint);
          }
        }

        for (const node of this.getNot(excluded)) {
          for (const tokenId of node.#childTokenIds) {
            tokenIds.add(tokenId);
          }
          if (node.#terminalTokenId !== undefined) {
            tokenIds.add(node.#terminalTokenId);
          }
          // node.getTokens(state.add(node.char), { maximumDepth, tokenIds, currentDepth: currentDepth + 1, });
        }
      } else if (rule.type === RuleType.END) {
        if (currentDepth === 0) {
          tokenIds.add(this.stopTokenId);
          // } else if (this.terminal !== undefined) {
          //   tokenIds.add(this.terminal);
        }
      }
    }
    return tokenIds;
  };
}

type ByteLevelDecoder = PreTrainedTokenizer['decoder'] & {
  byte_decoder: Record<string, string>;
};
