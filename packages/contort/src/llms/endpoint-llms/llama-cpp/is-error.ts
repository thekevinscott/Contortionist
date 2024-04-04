import { LlamaCPPError, LlamaCPPResponse, } from "./types.js";

export const isError = (response: LlamaCPPResponse | LlamaCPPError): response is LlamaCPPError => 'code' in response && 'type' in response && 'message' in response;
