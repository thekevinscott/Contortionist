import { InternalExecuteOptions, } from "../../types.js";
import { Caller, } from "./caller.js";

export interface Message {
  content: string; role: 'user' | 'assistant' | 'system'
}

interface LlamafileCallOpts {
  messages: Message[];
  n: number;
  grammar: string;
  stream: boolean;
}

// interface LlamafileStreamingResponse {
// }
interface Choice {
  delta: {
    content: string;
  }
  finish_reason: null | string;
  index: number;

}
interface LlamafileResponse {
  //   {
  //     "choices": [
  //         {
  //             "delta": {
  //                 "content": "1"
  //             },
  //             "finish_reason": null,
  //             "index": 0
  //         }
  //     ],
  //     "created": 1710781768,
  //     "id": "chatcmpl-RWLIw1Rv4xU2YBNqcQutV8bzrxUFYVVV",
  //     "model": "unknown",
  //     "object": "chat.completion.chunk"
  // }
}

interface LlamafileError {
  error: {
    code: number;
    message: string;
    type: string;
  }
}

export const isError = (response: LlamafileResponse | LlamafileError): response is LlamafileError => {
  return 'error' in response;
};

class LlamafileCaller extends Caller<LlamafileResponse> {
  result?: LlamafileResponse;
  override parseChunk = (chunk: string) => chunk.split('data:').pop()?.trim() || '';
  override parseResult = (result: LlamafileResponse) => {
    console.log(result);
    this.result = {
      ...result,
      content: (this.result?.content || '') + result.content,
    };
    this.partial += result.content;
  };
}

export class LlamafileLLM {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  };

  buildOpts = ({
    prompt,
    n,
    grammar,
    stream,
  }: InternalExecuteOptions<LlamafileResponse>): LlamafileCallOpts => {
    const messages: Message[] = [];
    // if (opts.system) {
    //   messages.push({
    //     "role": "system",
    //     "content": opts.system,
    //   });
    // }
    messages.push({
      "role": "user",
      "content": prompt,
    });
    return {
      messages,
      n,
      stream,
      grammar,
    };
  };

  execute = async ({ streamCallback, ...opts }: InternalExecuteOptions<LlamafileResponse>) => {
    const builtOpts = this.buildOpts(opts);
    const caller = new LlamafileCaller(this.endpoint, streamCallback);
    const response = await caller.fetch(this.endpoint, builtOpts) || caller.result;
    console.log('response', response);
    if (!response) {
      throw new Error('No response, caller was never called');
    }
    if (isError(response)) {
      throw new Error(JSON.stringify(response.error));
    }
    return response.content;
  };
}
