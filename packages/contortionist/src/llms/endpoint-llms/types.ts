export interface Opts {
  prompt: string;
  n: number;
  grammar: string;
  stream?: boolean;
}

export type BuildOpts<R extends Record<string, any>> = (opts: Opts) => R;
// export type Call = (opts: Opts) => Promise<string>;
