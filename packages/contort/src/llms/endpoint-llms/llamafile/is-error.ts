import { LlamafileError, LlamafileResponse, } from "./types.js";

export function isError<R extends LlamafileResponse>(response: R | LlamafileError): response is LlamafileError { return 'code' in response && 'type' in response && 'message' in response; }
