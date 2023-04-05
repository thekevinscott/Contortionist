import type { Tensor, } from "./types.js";
import type { TypedArray, } from "@xenova/transformers";

export function maskLogits<T extends TypedArray>(logits: Tensor<T>, ids: number[]) {
  const values = ids.map((id) => ([
    id,
    logits.data[id],
  ]));
  logits.data.fill(-Infinity);
  for (const [id, value,] of values) {
    logits.data[id] = value;
  }
  return logits;
};
