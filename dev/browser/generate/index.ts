import { pipeline, env } from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
// import { PreTrainedModel, TextGenerationConfig, TextGenerationPipeline, } from "@xenova/transformers";
import Contortionist from '../../../packages/contort/src/index.js';
import '@vanillawc/wc-monaco-editor';
const grammars = import.meta.glob('./grammars/*.gbnf', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// const model = {
//   // protocol: 'llama.cpp',
//   // endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
//   protocol: 'llamafile',
//   endpoint: import.meta.env.VITE_LLAMAFILE_ENDPOINT_URL,
// };
// debugger;
const model = pipeline('text-generation', 'Xenova/gpt2');
// const model = pipeline('text-generation', 'Xenova/phi-1_5_dev');
// const model = pipeline('text-generation', 'BricksDisplay/phi-1_5-q4');
// const model = pipeline('text-generation', 'Xenova/tiny-random-PhiForCausalLM');


const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const grammar = document.getElementById('grammar');
const output = document.getElementById('output');
const select = document.getElementById('grammar-selector') as HTMLSelectElement;

Object.entries(grammars).forEach(([path, grammar]: [string, string]) => {
  const option = document.createElement('option');
  option.value = grammar;
  option.innerText = path.split('/').pop();
  select.appendChild(option);
});

let abortController: AbortController = new AbortController();

select.onchange = () => {
  grammar.setAttribute('value', select.value);
  abortController.abort();
};

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value);
};

const synthesize = async (prompt: string) => {
  console.log('Synthesize!');
  button.setAttribute('disabled', '');
  try {
    const contortionist = new Contortionist({
      grammar: grammar.getAttribute('value'),
      model,
    });

    await contortionist.execute(prompt, {
      n: 10,
      stream: true,
      callback: ({ partial, chunk }) => {
        console.log(partial, chunk);
        output.textContent = partial;
      }
    });
  } catch (err) {
    console.error(err);
  }

  button.removeAttribute('disabled');
  abortController = new AbortController();
};

// synthesize(input.value);
