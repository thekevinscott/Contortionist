import { pipeline } from '@xenova/transformers';
import Contortionist from '../../../packages/contortionist/src/index.js';
import { CHESS_GRAMMAR } from '../gbnf/grammars.js';

for (const [protocol, model] of [
  // ['llama.cpp', {
  //   protocol: 'llama.cpp',
  //   endpoint: 'http://y7gaevebonopw3pxkknofmd2psbqv3x9l87adpb.thdl.us:4445/completion',
  // }],
  // ['llamafile', {
  //   protocol: 'llamafile',
  //   endpoint: 'http://y7gaevebonopw3pxkknofmd2psbqv3x9l87adpb.thdl.us:4444/v1/chat/completions',
  //   // endpoint: 'http://127.0.0.1:4444',
  // }],
  ['transformers.js', pipeline('text-generation', 'Xenova/gpt2'),],
]) {
  console.log('protocol', protocol);

  const contortionist = new Contortionist({
    // grammar: CHESS_GRAMMAR,
    grammar: 'root ::= "yes" ',
    // model: pipeline('text-generation', 'Xenova/gpt2'),
    model,
  });

  const output = await contortionist.execute('some prompt', {
    n: 9,
    // stream: true,
    // streamCallback: ({ partial }) => {
    //   console.log('partial', partial);
    // },
  });
  console.log(output);
}
