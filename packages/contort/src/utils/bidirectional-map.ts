export class BidirectionalMap<K, V> {
  private map: Map<K, V>;
  private reverseMap: Map<V, K>;
  constructor() {
    this.map = new Map<K, V>();
    this.reverseMap = new Map<V, K>();
  }

  set(key: K, value: V) {
    // Check if the key already exists and remove the old value from the reverseMap
    if (this.map.has(key)) {
      const currentValue = this.map.get(key);
      // Only delete if currentValue is not undefined to avoid removing keys without a previous value
      if (currentValue !== undefined) {
        this.reverseMap.delete(currentValue);
      }
    }
    // Additionally, remove the existing key that might be associated with the new value to maintain bidirectionality
    if (this.reverseMap.has(value)) {
      const currentKey = this.reverseMap.get(value);
      if (currentKey !== undefined) {
        this.map.delete(currentKey);
      }
    }
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }
  get(key: K) {
    return this.map.get(key);
  }
  reverseGet(value: V) {
    return this.reverseMap.get(value);
  }
  *[Symbol.iterator](): IterableIterator<[K, V]> {
    for (const [key, value,] of this.map) {
      yield [key, value,];
    }
  }

  get size() { return this.map.size; }
}
