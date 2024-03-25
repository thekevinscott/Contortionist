import { makeMockNonStreamingLlamafileResponse, makeMockStreamingLlamafileResponse } from "./__fixtures__/make-llamafile-response";
import { getContent } from "./get-content";

describe('getContent', () => {
  test('it handles undefined', () => {
    expect(getContent()).toEqual('');
  });

  test('it returns content for a non-streaming response', () => {
    expect(getContent(makeMockNonStreamingLlamafileResponse({ content: 'foo' }))).toEqual('foo');
  });

  test('it returns content for a streaming response', () => {
    expect(getContent(makeMockStreamingLlamafileResponse({ content: 'foo' }))).toEqual('foo');
  });

  test('it throws if given unexpected result', () => {
    expect(() => getContent({ foo: 'foo' } as any)).toThrow();
  });
});
