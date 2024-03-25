# Contortionist

A library for restricting what LLMs can and can't say.

## Install

```bash
npm install contortionist
```

## Usage

```javascript
import Contortionist from 'contortionist';
const grammar = 'root ::= "foo"';
const contortionist = new Contortionist({
  grammar,
  model: {
    protocol: 'llama.cpp',
    endpoint: 'http://localhost:4445',
  },
});

const result = await contortionist.execute(prompt, {
  n: 40,
  stream: true,
  callback: ({ partial }) => {
    output.textContent = partial;
  }
});
```
