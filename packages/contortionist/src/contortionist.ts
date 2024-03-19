import { getLLM, AbstractLLM, } from "./llms/index.js";
import { ContortionistOptions, DEFAULT_N, ExternalExecuteOptions, Grammar } from "./types.js";

export class Contortionist<R> {
  grammar: Grammar;
  llm: AbstractLLM;

  constructor({ grammar, model }: ContortionistOptions) {
    this.grammar = grammar;
    this.llm = getLLM(model);
  }

  execute = (prompt: string, {
    n = DEFAULT_N,
    stream,
    streamCallback,
  }: ExternalExecuteOptions<R> = {}) => {
    if (stream === false && streamCallback) {
      console.warn('streamCallback is ignored when stream is false');
    }
    if (streamCallback && stream === undefined) {
      stream = true;
    }
    return this.llm.execute({
      n,
      stream: !!stream,
      streamCallback,
      prompt,
      grammar: this.grammar,
    });
  };
}
