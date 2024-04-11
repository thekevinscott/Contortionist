import type { Tensor, } from "./types.js";
import type { TypedArray, } from "@xenova/transformers";

export function maskLogits<T extends TypedArray>(logits: Tensor<T>, ids: Set<number>) {
  const values = new Map<number, number>();
  for (const id of ids) {
    values.set(id, logits.data[id]);
  }
  logits.data.fill(-Infinity);
  for (const [id, value,] of values) {
    logits.data[id] = value;
  }
  return logits;
};
