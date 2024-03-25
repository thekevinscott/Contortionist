import { LlamaCPPResponse, } from "./types.js";

export const parse = (chunk: string) => JSON.parse(chunk) as LlamaCPPResponse;
