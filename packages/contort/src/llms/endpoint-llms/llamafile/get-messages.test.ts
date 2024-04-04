import { getMessages } from './get-messages.js';
import { Message } from './types';

describe('getMessages', () => {
  test('it accepts a string prompt', () => {
    expect(getMessages('foo')).toEqual([{ role: 'user', content: 'foo' }]);
  });

  test('it accepts a messages array', () => {
    const arg: Message[] = [
      { role: 'system', content: 'bar' },
      { role: 'user', content: 'foo' },
    ]
    expect(getMessages(arg)).toEqual(arg);
  });
});
