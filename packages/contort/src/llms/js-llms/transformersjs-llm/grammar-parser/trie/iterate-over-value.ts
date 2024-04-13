import type { Range, } from "gbnf";

export function* iterateOverValue(value: number | Range): IterableIterator<number> {
  if (typeof value === 'number') {
    yield value;
  } else {
    for (let i = value[0]; i <= value[1]; i++) {
      yield i;
    }
  }
}
