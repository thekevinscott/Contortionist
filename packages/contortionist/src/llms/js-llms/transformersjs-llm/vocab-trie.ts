import { RuleChar, RuleCharExclude, RuleEnd, RuleType, } from 'gbnf';
import { Tokenizer } from './tokenizer.js';
type Rule = RuleCharExclude | RuleChar | RuleEnd;
type Range = [number, number];
export const isRange = (range?: unknown): range is Range => Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number');
class Node {
  nodes: Map<number, TokenNode> = new Map();
  public add(id: number, token: string, pos = 0) {
    const char = token.codePointAt(pos);
    if (!this.nodes.has(char)) {
      this.nodes.set(char, new TokenNode(char));
    }
    if (pos < token.length - 1) {
      this.nodes.get(char).add(id, token, pos + 1);
    } else {
      this.nodes.get(char).token = { token, id, };
    }
  }
}
export interface Token {
  token: string;
  id: number;
}
class TokenNode extends Node {
  code: number;
  token?: Token;

  constructor(code: number) {
    super();
    this.code = code;
  }
}


export class VocabTrie {
  root = new Node();
  stopToken: Token;
  tokenizer: Tokenizer;

  initialize = () => {
    // TODO: Figure this out
    const vocab = new Map<number, string>();
    for (let i = 0; i < 50000; i++) {
      const char = String.fromCodePoint(i);
      try {
        const inputId = this.tokenizer.getEncodingId(char);

        if (!vocab.has(inputId)) {
          vocab.set(inputId, char);
        }
      } catch (err) { }
    }
    if (vocab.has(this.tokenizer.stopTokenId)) {
      throw new Error(`Duplicate token for stop token: ${this.tokenizer.stopTokenId}`);
    }
    vocab.set(this.tokenizer.stopTokenId, this.tokenizer.stopToken);
    for (const [id, token,] of vocab) {
      if (!token) {
        console.error(id, vocab);
        throw new Error('wruhoh');
      }
      if (token === this.tokenizer.stopToken) {
        this.stopToken = {
          id,
          token,
        };
      } else {
        // for now, we only support tokens with length of 1
        if (token.length == 1) {
          this.root.add(id, token);
        }
      }
    }
    // debugger;
    // for (const [tokenId, node,] of this.root.nodes.entries()) {
    //   console.log(tokenId, node.token?.token, node.token?.id);
    // }
    // debugger;
    if (!this.stopToken) {
      throw new Error(`Stop token "${this.tokenizer.stopTokenId}" was not found in vocab`);
    }
  };

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
  }

  getTokens = (rules: Rule[]) => {
    const tokens: Token[] = [];
    for (const rule of rules) {
      if (rule.type === RuleType.CHAR) {
        for (const value of rule.value) {
          if (typeof value === 'number') {
            const node = this.root.nodes.get(value);
            if (node && node.token !== undefined) {
              tokens.push(node.token);
            }
          } else if (isRange(value)) {
            const range = Array.from({ length: value[1] - value[0] + 1, }, (_, i) => value[0] + i);
            for (const codePoint of range) {
              const node = this.root.nodes.get(codePoint);
              if (node && node.token !== undefined) {
                tokens.push(node.token);
              }
            }
          }
        }
      } else if (rule.type === RuleType.CHAR_EXCLUDE) {
        const excludedTokens = new Set<number>();
        for (const value of rule.value) {
          if (typeof value === 'number') {
            excludedTokens.add(value);
          } else if (isRange(value)) {
            for (let i = value[0]; i <= value[1]; i++) {
              excludedTokens.add(i);
            }
          }
        }
        for (const [tokenId, node,] of this.root.nodes.entries()) {
          if (!excludedTokens.has(tokenId) && node.token !== undefined) {
            tokens.push(node.token);
          }
        }
      } else if (rule.type === RuleType.END) {
        tokens.push(this.stopToken);
        // } else {
        // throw new Error(`Only CHAR rules are supported: ${rule.type}`);
      }
    }
    return tokens;
  };
}

