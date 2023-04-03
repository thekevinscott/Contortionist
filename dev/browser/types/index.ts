import { Contortionist } from "../../../packages/contortionist/src/contortionist.js";

const contortionllamafileNonStreaming = new Contortionist({ grammar: 'g', model: { endpoint: 'a', protocol: 'llamafile', }, });
contortionllamafileNonStreaming.execute('p', {
  stream: false,
  callback: ({ chunk, }) => console.log(chunk),
});
const contortionllamafileStreaming = new Contortionist({ grammar: 'g', model: { endpoint: 'a', protocol: 'llamafile', }, });
contortionllamafileStreaming.execute('p', {
  stream: true,
  callback: ({ chunk, }) => console.log(chunk),
});
const contortionllamacpp = new Contortionist({ grammar: 'g', model: { endpoint: 'b', protocol: 'llama.cpp', }, });
contortionllamacpp.execute('p', { callback: ({ chunk, }) => console.log(chunk), });
