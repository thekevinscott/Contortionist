import { LlamafileResponse, } from "./types.js";

export function parse<R extends LlamafileResponse>(chunk: string) { return JSON.parse(chunk) as R; }
