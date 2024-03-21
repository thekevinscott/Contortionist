import { getLLM, AbstractLLM, } from "./llms/index.js";
import { ConstructorOptions, DEFAULT_N, ExternalExecuteOptions, Grammar, ModelProtocol } from "./types.js";

export class Contortionist<M extends ModelProtocol> {
  grammar: Grammar;
  llm: AbstractLLM;

  /**
   * @hidden
  */
  _abortController = new AbortController();

  /**
   * Instantiates an instance of Contortionist.
   * 
   * ```javascript
   * import Contortionist from 'contort';
   * 
   * const contort = new Contortionist({
   *   grammar: ' ... some grammar ... ',
   *   model: {},
   * });
   * ```
   * 
   * @returns an instance of a Contortionist class.
   */
  constructor({ grammar, model }: ConstructorOptions) {
    this.grammar = grammar;
    this.llm = getLLM(model);
  }

  execute = (prompt: string, {
    n = DEFAULT_N,
    stream,
    streamCallback,
    signal,
  }: ExternalExecuteOptions<M> = {}) => {
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
      internalSignal: this._abortController.signal,
      externalSignal: signal,
    });
  };

  /**
   * Aborts all active asynchronous methods
   * 
   * ```javascript
   * const contortionist = new Contortionist();
   * contortionist.abort();
   * ```
   */
  abort = (): void => {
    this._abortController.abort();
    this._abortController = new AbortController();
  };
}
