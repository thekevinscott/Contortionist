import {
  pipeline, env, PreTrainedTokenizer,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
// import { PreTrainedModel, TextGenerationConfig, TextGenerationPipeline, } from "@xenova/transformers";
import Contortionist from '../../../packages/contort/src/index.js';
import '@vanillawc/wc-monaco-editor';
import { ModelDefinition, ModelProtocol, } from 'contort';
const grammars = import.meta.glob('../grammars/*.gbnf', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// const model = {
//   protocol: 'llamafile',
//   endpoint: import.meta.env.VITE_LLAMAFILE_ENDPOINT_URL,
// };
// debugger;
// const model = pipeline('text-generation', 'Xenova/phi-1_5_dev');
// const model = pipeline('text-generation', 'BricksDisplay/phi-1_5-q4');
// const model = pipeline('text-generation', 'Xenova/tiny-random-PhiForCausalLM');


const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const grammarEditor = document.getElementById('grammar');
const output = document.getElementById('output');
const selectGrammar = document.getElementById('grammar-selector') as HTMLSelectElement;
const selectModel = document.getElementById('model-selector') as HTMLSelectElement;

Object.entries(grammars).forEach(([path, grammar,]: [string, string]) => {
  const option = document.createElement('option');
  option.value = grammar;
  option.innerText = path.split('/').pop();
  if (path.endsWith('c.gbnf')) {
    option.selected = true;
    grammarEditor.value = grammar;
  }
  selectGrammar.appendChild(option);
});

type ModelGetter = () => ModelDefinition<ModelProtocol>;
const models = [
  'Xenova/gpt2',
  'Xenova/codegen-350M-mono',
  'Xenova/llama-160m',
  // 'Xenova/WizardCoder-1B-V1.0',
].reduce<Record<string, ModelGetter>>((acc, model) => {
  const modelGetter: ModelGetter = () => pipeline('text-generation', model);
  return {
    ...acc,
    [model]: modelGetter,
  };
}, {
  'llama.cpp': () => ({
    protocol: 'llama.cpp',
    endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
  }),
  'llamafile': () => ({
    protocol: 'llamafile',
    endpoint: import.meta.env.VITE_LLAMAFILE_ENDPOINT_URL,
  }),
});
Object.keys(models).forEach(model => {
  const option = document.createElement('option');
  option.value = model;
  option.innerText = model;
  if (model === 'llama.cpp') {
    option.selected = true;
  }
  selectModel.appendChild(option);
});

let abortController: AbortController = new AbortController();

selectGrammar.onchange = () => {
  grammarEditor.setAttribute('value', selectGrammar.value);
  abortController.abort();
};

let generating = false;
let contortionist: Contortionist<any>;
form.onsubmit = async (e) => {
  e.preventDefault();
  if (generating) {
    contortionist?.abort();
  } else {
    await synthesize(input.value + "\n");
  }
};

const loadedModels = new Map();

const n = 10;

const synthesize = async (prompt: string) => {
  generating = true;
  if (!loadedModels.get(selectModel.value)) {
    loadedModels.set(selectModel.value, await models[selectModel.value]());
  }
  const model = loadedModels.get(selectModel.value);
  console.log('Synthesize!');
  button.innerText = 'Abort';
  contortionist = new Contortionist({
    model,
  });

  try {
    contortionist.grammar = grammarEditor.value;

    await contortionist.execute(prompt, {
      n_predict: n,
      stream: true,
      callback: ({ partial, chunk, }) => {
        // console.log('grammar', partial);
        output.textContent = partial;
      },
    });
    console.log('complete, grammar');
  } catch (err) {
    console.error(err);
  }
  console.log('done synthesizing!');

  generating = false;
  abortController = new AbortController();

};
