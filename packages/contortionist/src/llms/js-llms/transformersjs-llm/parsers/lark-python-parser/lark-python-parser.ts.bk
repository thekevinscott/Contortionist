import { loadPyodide, } from "pyodide";
import * as path from 'path';
import pythonCode from './code.py?raw';


import { Tokenizer, } from "../../llms/js-llms/transformersjs-llm/tokenizer.js";
import { AbstractParser, } from "../abstract-parser.js";
import { PyodideInterface, } from "pyodide";
import { Tensor, } from "@xenova/transformers";
// import { get_parser as helloWorldParser } from './hello_world_parser.js';
// import { get_parser as JSONParser } from './grammars/json/json-parser.js';

export class LarkPythonParser extends AbstractParser {
  // parser = JSONParser();
  terminals = new Map<string, RegExp>();
  decodedTokens: Record<number, string> = {};
  pyodide?: Promise<PyodideInterface>;
  validNextLex?: string[];
  validTokenIDs?: number[];

  // stopTokenId: number;

  constructor(tokenizer: Tokenizer) {
    super(tokenizer);

    this.pyodide = this.initialize(tokenizer);
    // this.stopTokenId = parseInt(this.tokenizer.encode('<|endoftext|>').input_ids.data[0], 10);
  }

  get vocab(): string[] {
    return this.tokenizer.vocab;
  }

  initialize = async (tokenizer: Tokenizer): Promise<PyodideInterface> => {
    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full',
      // "indexURL": path.resolve('../../packages/coder/node_modules/pyodide'),
    });
    await pyodide.loadPackage("micropip", {
      messageCallback: (...e) => { },
      errorCallback: (...e) => { },
      // messageCallback: (...e) => console.log('micropip', ...e),
      // errorCallback: (...e) => console.error('micropip', ...e),
    });
    const micropip = pyodide.pyimport("micropip");
    await Promise.all([
      micropip.install('lark'),
      micropip.install('regex', {}),
    ]);

    await pyodide.runPythonAsync(pythonCode);
    const vocab = JSON.stringify(JSON.stringify(this.vocab));
    await pyodide.runPythonAsync(`token_filter = ReTokenFilter(json.loads(${vocab}))`);
    return pyodide;
  };

  nextLex = async ({ partialCompletion, }) => {
    const pyodide = await this.pyodide;
    this.validTokenIDs = JSON.parse(await pyodide.runPythonAsync(`dump(get_valid_token_ids(${JSON.stringify(partialCompletion)}, token_filter))`));
    // this.validTokenIDs.unshift(this.stopTokenId);
    // console.log(this.validTokenIDs)
  };

  get shouldContinue() {
    if (this.validTokenIDs.length === 0) {
      // console.log('should not continue', this.validTokenIDs)
      return false;
    }
    return true;
  }

  getAllowedTokens = (): number[] => {
    // getAllowedTokens = (inputTokens: number[], logits: Tensor): number[] => {
    if (!this.validTokenIDs) {
      throw new Error('No valid token IDs found');
    }
    const validTokenIDs = this.validTokenIDs;
    // const originalValues = validTokenIDs.map(tokenID => ({ word: this.vocab[tokenID], tokenID }));
    // console.log(`Total valid tokens: ${originalValues.length}`);
    // console.table(originalValues.slice(0, 150));
    // const originalValues = validTokenIDs.map(tokenID => ({ word: this.vocab[tokenID], tokenID, score: logits.data[tokenID], }));
    // console.log(`Total valid tokens: ${originalValues.length}`);
    // console.table(originalValues.sort((a, b) => b.score - a.score).slice(0, 150));
    this.validTokenIDs = [];
    return validTokenIDs;
    // console.log(this.validNextLex)
    // const patterns = Array.from(this.validNextLex).map((t: string) => {
    //   const re = new RegExp(this.terminals.get(t));
    //   return {
    //     t,
    //     re,
    //   };
    // });
    // // console.log('patterns', patterns)
    // const validTokenIds: number[] = [];
    // for (const [tokenId, word] of this.decodedTokens) {
    //   for (const { re, t } of patterns) {
    //     if (re.test(word)) {
    //       validTokenIds.push(tokenId)
    //       break;
    //     }
    //   }
    // }
    // return validTokenIds;
  };
}
