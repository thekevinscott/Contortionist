import { LlamafilePrompt, Message, isPromptString, } from "./types.js";

export const getMessages = (prompt: LlamafilePrompt): Message[] => {
  if (isPromptString(prompt)) {
    return [{ "role": "user", "content": prompt, },];
  }
  return prompt;
};

