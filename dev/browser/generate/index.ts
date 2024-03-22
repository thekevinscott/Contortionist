import Contortionist from '../../../packages/contortionist/src/index.js';
import '@vanillawc/wc-monaco-editor';
const grammars = import.meta.glob('./grammars/*.gbnf', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const model = {
  protocol: 'llama.cpp',
  endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
};

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
  console.log(option)
  select.appendChild(option);
});

let abortController: AbortController = new AbortController();

select.onchange = () => {
  console.log(select.value)
  grammar.setAttribute('value', select.value);
  abortController.abort();
};

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value);
};

const synthesize = async (prompt: string) => {
  const contortionist = new Contortionist({
    grammar: grammar.getAttribute('value'),
    model,
  });

  button.setAttribute('disabled', '');
  await contortionist.execute(prompt, {
    n: 400,
    stream: true,
    streamCallback: ({ partial }) => {
      output.textContent = partial;
    }
  });

  button.removeAttribute('disabled');
  abortController = new AbortController();
};

synthesize(input.value);