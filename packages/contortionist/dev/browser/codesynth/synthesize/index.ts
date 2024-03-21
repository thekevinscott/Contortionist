import Codesynth from '../../../../packages/codesynth/src/index.js';

const synth = new Codesynth({
  language: 'json',
  model: {
    protocol: 'llama.cpp',
    endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
  }
});

const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const output = document.getElementById('output');
const validity = document.getElementById('validity');

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value);
};

const synthesize = async (prompt: string) => {
  button.setAttribute('disabled', '');
  const result = await synth.synthesize(prompt, {
    n: 400,
    stream: true,
    streamCallback: ({ partial }) => {
      output.textContent = partial;
      // const trimmed = partial.trim();
      // try {
      //   output.textContent = JSON.stringify(JSON.parse(trimmed), null, 2);
      // } catch (err) {
      //   output.textContent = trimmed;
      // }
    }
  });

  try {
    output.textContent = JSON.stringify(JSON.parse(result), null, 2);
    validity.textContent = 'Valid JSON';
  } catch (err) {
    validity.textContent = 'Invalid JSON';
  }
  button.removeAttribute('disabled');
};

synthesize(input.value);
