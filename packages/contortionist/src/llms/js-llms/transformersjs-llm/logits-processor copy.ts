import { Tensor, } from "@xenova/transformers";
import { Tokenizer, } from "./tokenizer.js";
import { AbstractParser, } from "../../../parsers/index.js";

export class LogitsProcessor {
  tokenizer: Tokenizer;
  parser: AbstractParser;
  constructor(tokenizer: Tokenizer, parser: AbstractParser) {
    this.tokenizer = tokenizer;
    this.parser = parser;
  }

  getAllowedToken = (word: string) => {
    const { input_ids: { dims: [b, n,], data, }, } = this.tokenizer.encode(word);
    if (n > 1) {
      throw new Error(`token.length is ${n} for word ${word}`);
    }

    return data[0];
  };
  // process = (logits: { token: string; logprob: number; }[]) => {
  //   const allowedTokens = this.parser.getAllowedTokens().map(tokenId => this.tokenizer.decode(tokenId));
  //   const sortedLogits = logits.sort((a, b) => b.logprob - a.logprob);
  //   console.log('sortedLogits', sortedLogits)
  //   for (let i = 0; i < sortedLogits.length; i++) {
  //     const token = sortedLogits[i].token;
  //     if (!allowedTokens.includes(token.trim())) {
  //       console.log('got a hit!', token)
  //       return token;
  //     } else {
  //       console.log('no hit for token', token, 'in', allowedTokens)
  //     }
  //   }
  //   throw new Error('Nothing valid found')
  //   // logits.data.fill(-Infinity);
  //   // Object.entries(originalValues).forEach(([token_id, value]) => {
  //   //   logits.data[token_id] = value;
  //   // });
  //   // // console.log('originalValues', Object.keys(originalValues).length);
  //   // // console.table(Object.entries(originalValues).sort((a, b) => b[1] - a[1]).map(([token, score]) => ({
  //   // //   token: this.tokenizer.decode(parseInt(token, 10)),
  //   // //   score,
  //   // // })).slice(0, 15));
  //   // return logits;
  // }
  processors = [(input_tokens: number[], logits: Tensor) => {
    console.log('processors', input_tokens, logits);
    const originalValues: Record<number, number> = this.parser.getAllowedTokens(input_tokens, logits).reduce<Record<number, number>>((obj, word) => {
      const tokenId = typeof word !== 'number' ? this.getAllowedToken(word) : word;
      return {
        ...obj,
        [tokenId]: logits.data[tokenId],
      };
    }, {});
    (logits.data).fill(-Infinity);
    Object.entries(originalValues).forEach(([token_id, value,]) => {
      logits.data[token_id] = value;
    });
    // console.log('originalValues', Object.keys(originalValues).length);
    // console.table(Object.entries(originalValues).sort((a, b) => b[1] - a[1]).map(([token, score]) => ({
    //   token: this.tokenizer.decode(parseInt(token, 10)),
    //   score,
    // })).slice(0, 15));
    return logits;
  },];
  // processors: any = [(_input_tokens: number[], logits: any) => {
  //   // console.log(generator.tokenizer.decode(input_ids))
  //   // const allowed_token_ids = token_filter.filter_tokens(generatedText, pattern)
  //   // console.log()
  //   const allowedTokens = parser.getAllowedTokens(partialCompletion, valid_next_lex);
  //   const allowed_token_ids = allowedTokens.filter(t => {
  //     if (t === '"""') {
  //       return false;
  //     }
  //     if (t === '""') {
  //       return false;
  //     }
  //     return true;
  //   }).map((t) => {
  //     const token_ids = generator.tokenizer.encode(t);
  //     if (token_ids.length > 1) {
  //       throw new Error(`token_ids.length > 1 for t ${t}`);
  //     }
  //     return {
  //       t,
  //       id: token_ids[0],
  //     };
  //   });
  //   console.log('allowed_token_ids', allowed_token_ids);
  //   // console.log('allowed_token_ids', allowed_token_ids, allowed_token_ids.map(token_id => {
  //   //   return generator.tokenizer.decode([token_id])
  //   // }));
  //   console.log(allowed_token_ids.map(({ t, id: token_id }) => {
  //     return {
  //       t,
  //       token_id,
  //       score: logits.data[token_id],
  //     }
  //   }).sort((a, b) => b.score - a.score));
  //   const originalValues = allowed_token_ids.reduce<Record<number, number>>((obj, { id: token_id }) => {
  //     return {
  //       ...obj,
  //       [token_id]: logits.data[token_id],
  //     }
  //   }, {});
  //   const eosToken = generator.tokenizer.encode(generator.tokenizer.special_tokens[0]).pop();
  //   if (eosToken === undefined) {
  //     throw new Error('no eos token')
  //   }
  //   logits.data.fill(-Infinity);
  //   Object.entries(originalValues).forEach(([token_id, value]) => {
  //     logits.data[token_id] = value;
  //   });
  //   return logits;
  // }];

  [Symbol.iterator]() {
    return this.processors.values();
  }
}
