import { LlamafileError, LlamafileResponse, NonStreamingLlamafileResponse, StreamingLlamafileResponse, } from "../types.js";

export function makeMockNonStreamingLlamafileResponse({ content, ...r }: Partial<LlamafileResponse> & { content: string }): NonStreamingLlamafileResponse {
  return {
    created: 123,
    id: '123',
    model: 'unknown',
    object: '',
    choices: [{
      finish_reason: '',
      index: 0,
      message: {
        content,
        role: 'user',
      },
    },],
    ...r,
  };
};
export function makeMockStreamingLlamafileResponse({ content, ...r }: Partial<LlamafileResponse> & { content: string }): StreamingLlamafileResponse {
  return {
    created: 123,
    id: '123',
    model: 'unknown',
    object: '',
    choices: [{
      finish_reason: '',
      index: 0,
      delta: {
        content,
      },
    },],
    ...r,
  };
};

export const makeMockLlamaCPPError = (error: Partial<LlamafileError> = {}): LlamafileError => ({
  code: 0,
  message: 'message',
  type: 'type',
  ...error,
});
