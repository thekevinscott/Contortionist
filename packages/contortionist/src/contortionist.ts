import { getLLM, } from "./llms/index.js";
import { ChosenLLM, ConstructorOptions, DEFAULT_N, ExternalExecuteOptions, Grammar, ModelDefinition, ModelProtocol, Prompt, } from "./types.js";

export class Contortionist<M extends ModelProtocol> {
  private _grammar?: Grammar;
  private _llm?: ChosenLLM<M>;

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
  public get llm(): ChosenLLM<M> {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    return this._llm;
  }

  async execute<S extends boolean>(prompt: Prompt<M>, {
    n = DEFAULT_N,
    stream,
    callback,
    signal,
  }: ExternalExecuteOptions<M, S> = {}) {
    if (!this._llm) {
      throw new Error('You must set an LLM before running.');
    }
    if (stream === false && callback) {
      console.warn('streamCallback is ignored when stream is false');
    }
    const llm: ChosenLLM<M> = this.llm;
    const r = await llm.execute({
      n,
      stream: (callback && stream === undefined) ? true : !!stream,
      callback,
      prompt,
      grammar: this._grammar,
      signal: signal || this._abortController.signal,
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

const c1 = new Contortionist({
  model: {
    endpoint: 'foo',
    protocol: 'llama.cpp',
  },
});
c1.llm;

const c2 = new Contortionist({
  model: {
    endpoint: 'foo',
    protocol: 'llamafile',
  },
});
c2.llm;
