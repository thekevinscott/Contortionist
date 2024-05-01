import type {
  LogitProcessor,
  ChatCompletionChunk,
  ChatCompletionRequestStreaming,
} from "@mlc-ai/web-llm";
import type {
  Tokenizer,
} from "@mlc-ai/web-tokenizers";
import type {
  Callback as _Callback,
  InternalExecuteOptions,
} from "../../../types.js";
export type WebLLMPrompt = string;
export type Callback = _Callback<'web-llm', null>;

export type WebLLMOpts = Record<string, unknown>;
export interface WebLLMExecuteOptions extends Omit<InternalExecuteOptions, 'stream'> {
  prompt: WebLLMPrompt;
  callback: Callback;
  llmOpts?: WebLLMOpts;
}

export type LogitProcessorRegistry = Map<string, LogitProcessor>;
interface EngineInterface {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  // pipeline: LLMChatPipeline & {
  //   tokenizer: Tokenizer;
  // };
  currentModelId: string;
  pipeline: {
    tokenizer: Tokenizer;
  };
  config: {
    conv_template: {
      stop_token_ids: [number];
    }
  }
  setLogitProcessorRegistry: (logitProcessorRegistry: LogitProcessorRegistry) => void;
  reload: (currentModelId: string) => Promise<void>;
  chat: {
    completions: {
      create: (
        request: ChatCompletionRequestStreaming,
      ) => Promise<AsyncGenerator<ChatCompletionChunk, void, void>>;
    }
  }
  interruptGenerate: () => Promise<void>;
};

export type WebLLMResponse = unknown;

export type WebLLMModelDefinition = EngineInterface;

export type { LogitProcessor, } from "@mlc-ai/web-llm";
export type { Tokenizer, } from "@mlc-ai/web-tokenizers";
