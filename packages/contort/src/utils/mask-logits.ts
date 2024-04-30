import type { TypedArray, } from "@xenova/transformers";

export function maskLogits<T extends TypedArray>(logits: T, ids: Set<number>) {
  const values = new Map<number, number>();
  for (const id of ids) {
    values.set(id, logits[id]);
  }
  logits.fill(-Infinity);
  for (const [id, value,] of values) {
    logits[id] = value;
  }
  return logits;
};
