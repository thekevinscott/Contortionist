import { LlamaCPPLLM, } from "./llms/endpoint-llms/llama-cpp-llm.js";
import { getLLM, } from "./llms/index.js";
import { ConstructorOptions, DEFAULT_N, ExternalExecuteOptions, Grammar, ModelDefinition, ModelProtocol, } from "./types.js";

export class Contortionist<M extends ModelProtocol> {
  private _grammar?: Grammar;
  private _llm?: LlamaCPPLLM;

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
  constructor({ grammar, model, }: ConstructorOptions) {
    this.grammar = grammar;
    this.llm = model;
  }

  public get grammar() {
    return this._grammar;
  }
  public set grammar(grammar: Grammar | undefined) {
    this._grammar = grammar;
  }
  public set llm(model: ModelDefinition | undefined) {
    this._llm = model ? getLLM(model) : undefined;
  }
  public get llm(): LlamaCPPLLM {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    return this._llm;
  }

  execute = async (prompt: string, {
    n = DEFAULT_N,
    stream,
    callback,
    signal,
  }: ExternalExecuteOptions<M> = {}) => {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    if (stream === false && callback) {
      console.warn('streamCallback is ignored when stream is false');
    }
    if (callback && stream === undefined) {
      stream = true;
    }
    const llm = this.llm;
    const r = await llm.execute({
      n,
      stream: !!stream,
      callback,
      prompt,
      grammar: this._grammar,
      internalSignal: this._abortController.signal,
      externalSignal: signal,
    });
    return r;
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
