import { InternalExecuteOptions, } from "../../../types.js";

export type LlamafilePrompt = string | Message[];
export type LlamafileExecuteOptions = InternalExecuteOptions<StreamingLlamafileResponse | NonStreamingLlamafileResponse, LlamafilePrompt>;

type Role = 'user' | 'assistant' | 'system';
export interface Message {
  content: string;
  role: Role;
}

export interface LlamafileCallOpts {
  messages: Message[];
  n: number;
  grammar: string;
  stream: boolean;
}

interface Choice {
  finish_reason: string;
  index: number;
}

interface NonStreamingChoice extends Choice {
  message: {
    content: string;
    role: Role;
  };
}
interface StreamingChoice extends Choice {
  delta: {
    content: string;
  }
}

export interface LlamafileResponse {
  created: number;
  id: string;
  model: string;
  object: string;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  }
}
export interface StreamingLlamafileResponse extends LlamafileResponse {
  choices: StreamingChoice[];
};
export interface NonStreamingLlamafileResponse extends LlamafileResponse {
  choices: NonStreamingChoice[];
};

export interface LlamafileError {
  code: number;
  message: string;
  type: string;
}

export const isLlamafileResponseStreaming = (response: LlamafileResponse): response is StreamingLlamafileResponse => {
  return 'choices' in response && 'delta' in response.choices[0];
};
export const isLlamafileResponseNonStreaming = (response: LlamafileResponse): response is NonStreamingLlamafileResponse => {
  return 'choices' in response && 'message' in response.choices[0];
};
export const isPromptString = (prompt: LlamafilePrompt): prompt is string => typeof prompt === 'string';
