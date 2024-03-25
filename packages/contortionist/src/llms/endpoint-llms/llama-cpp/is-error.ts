import { LlamaCPPError, LlamaCPPResponse, } from "./types.js";

export const isError = (response: LlamaCPPResponse | LlamaCPPError): response is LlamaCPPError => 'error' in response;
