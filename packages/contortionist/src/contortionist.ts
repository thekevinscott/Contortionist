import { getLLM, } from "./llms/index.js";
import {
  DEFAULT_N,
  type ConstructorOptions,
  type ExternalExecuteOptions,
  type Grammar,
  type ILLM,
  type ModelDefinition,
  type ModelProtocol,
  type Prompt,
} from "./types.js";

export class Contortionist<M extends ModelProtocol> {
  private _grammar?: Grammar;
  // private _llm?: ChosenLLM<M>;
  private _llm?: ILLM;

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
  constructor({ grammar, model, }: ConstructorOptions<M>) {
    this.grammar = grammar;
    this.llm = model;
  }

  public get grammar() {
    return this._grammar;
  }
  public set grammar(grammar: Grammar | undefined) {
    this._grammar = grammar;
  }
  public set llm(model: ModelDefinition<M> | undefined) {
    this._llm = model ? getLLM<M>(model) : undefined;
  }
  public get llm(): ILLM {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    return this._llm;
  }

  /**
   * Executes a prompt against an LLM backend.
   * 
   * ```javascript
   * const contortionist = new Contortionist({
   *  model: { protocol: 'llama.cpp', endpoint: '/path/to/api' },
   *  grammar: ' ... some grammar ... ',
   * });
   * contortionist.execute('Write me some code', {
   *  n: 128,
   *  stream: true,
   *  callback: ({ partial, chunk, }) => {
   *    console.log(partial); // the partially built string for each streaming response
   *    console.log(chunk); // the full parsed JSON chunk returned for the streaming response
   *  },
   * })
   * contortionist.abort();
   * ```
   */
  execute<S extends boolean>(prompt: Prompt<M>, {
    n = DEFAULT_N,
    stream,
    callback,
    signal,
  }: ExternalExecuteOptions<M, S>) {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    if (stream === false && callback) {
      console.warn('streamCallback is ignored when stream is false');
    }
    return this.llm.execute({
      prompt,
      n,
      stream: (callback && stream === undefined) ? true : !!stream,
      callback,
      grammar: this._grammar,
      signal: signal || this._abortController.signal,
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
