// import { AutoTokenizer } from '@xenova/transformers';
import { pipeline, env } from '@xenova/transformers';
import Contortionist from '../../../packages/contort/src/index.js';
env.allowRemoteModels = true;
env.allowLocalModels = false;


const model = await pipeline('text-generation', 'Xenova/LaMini-Cerebras-256M');
console.log('----------------- Loaded model -----------------');
console.log(model)
debugger;

// const tokenizer = await AutoTokenizer.from_pretrained('Xenova/bert-base-uncased');
const tokenizer = model.tokenizer;
// console.log(tokenizer)
// const { input_ids } = await tokenizer('I love transformers!');
const str = 'Some big fat piece of text daddy-o!!!! #';
console.log(str);
const { input_ids } = await tokenizer(str);
console.log('input_ids', [...input_ids.data].map(n => Number(n)))
// console.log('model', tokenizer.model)
console.log('vocab', tokenizer.model.vocab)
console.log('vocab as decoded', tokenizer.model.vocab.map((token, tokenId) => tokenizer.decode([tokenId])))
const input_ids_as_nums = [...input_ids.data].map(n => Number(n));

console.log('input_ids', input_ids_as_nums.map(n => tokenizer.model.vocab[n]))
console.log(tokenizer.decode(input_ids_as_nums));


console.log('vocab piece', 1263, tokenizer.model.vocab[1263], `"${tokenizer.decode([1263])}"`)

// console.log((await model('I love transformers!'))[0])

const contortionist = new Contortionist({
  grammar: `root ::= "foo" `,
  model,
});

contortionist.execute('Write me some code');
