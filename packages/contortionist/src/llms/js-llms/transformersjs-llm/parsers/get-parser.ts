import { Tokenizer, } from "../llms/js-llms/transformersjs-llm/tokenizer.js";
import { DumbParser, } from "./dumb-parser.js";
// import { LarkJSParser } from "./larkjs-parser/index.js";
import { LarkPythonParser, } from "./lark-python-parser/index.js";

export type ParserKey = 'larkjs' | 'lark' | 'default';
export const getParser = (tokenizer: Tokenizer, key?: ParserKey) => {
  // if (key === 'larkjs') {
  //   return new LarkJSParser(tokenizer);
  // }

  if (key === 'lark') {
    return new LarkPythonParser(tokenizer);
  }

  return new DumbParser(tokenizer);
};

