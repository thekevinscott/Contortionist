import { makeLlamaCPPResponse } from "../__mocks__/mock-llama-cpp-response.js";
import MockLLMAPI from "./mock-llm-api.js";

export const configureNonStreamingServer = (content: string) => {
  const mockLLMAPI = new MockLLMAPI();
  const endpoint = `http://localhost:${mockLLMAPI.port}/completion`;

  mockLLMAPI.app.post('/completion', (req, res) => {
    res.send(`${JSON.stringify(makeLlamaCPPResponse({
      content,
    }))}`);
  });
  return { endpoint, mockLLMAPI, };
};

export const configureStreamingServer = (content: string, n: number) => {
  const mockLLMAPI = new MockLLMAPI();
  const endpoint = `http://localhost:${mockLLMAPI.port}/completion`;

  mockLLMAPI.app.post('/completion', async (req, res) => {
    for (let i = 0; i < n; i++) {
      res.write(`data: ${JSON.stringify(makeLlamaCPPResponse({
        content: `${content[i]}`,
      }))}\n`);

      // TODO: Is there a way to avoid this?
      await new Promise((r) => setTimeout(r, 10));
    }
    res.end();
  });
  return { endpoint, mockLLMAPI, };
};
