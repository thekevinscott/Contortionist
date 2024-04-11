import { describe, it, expect } from 'vitest';
import { BidirectionalMap } from './bidirectional-map.js';

describe('BidirectionalMap', () => {
  it('should create an empty map', () => {
    const bidimap = new BidirectionalMap<string, number>();
    expect(bidimap.get('anything')).toBeUndefined();
    expect(bidimap.reverseGet(42)).toBeUndefined();
  });

  it('sets and gets a key-value pair correctly', () => {
    const bidimap = new BidirectionalMap<string, number>();
    bidimap.set('one', 1);
    expect(bidimap.get('one')).toBe(1);
    expect(bidimap.reverseGet(1)).toBe('one');
  });

  it('returns undefined for unknown keys and values', () => {
    const bidimap = new BidirectionalMap<string, number>();
    expect(bidimap.get('missing')).toBeUndefined();
    expect(bidimap.reverseGet(999)).toBeUndefined();
  });

  it('overwrites values correctly', () => {
    const bidimap = new BidirectionalMap<string, number>();
    bidimap.set('one', 1);
    bidimap.set('one', 2); // Overwrite the value for 'one'
    expect(bidimap.get('one')).toBe(2);
    expect(bidimap.reverseGet(1)).toBeUndefined(); // The reverse mapping for 1 should be removed
    expect(bidimap.reverseGet(2)).toBe('one');
  });

  it('updates reverse map correctly when a new value for an existing key is set', () => {
    const bidimap = new BidirectionalMap<string, string>();
    bidimap.set('a', 'alpha');
    bidimap.set('b', 'beta');
    bidimap.set('a', 'beta'); // Update 'a' to have the value 'beta', which is already a value for 'b'

    expect(bidimap.get('a')).toBe('beta');
    expect(bidimap.get('b')).toBeUndefined(); // 'b' should no longer map to 'beta'
    expect(bidimap.reverseGet('alpha')).toBeUndefined(); // 'alpha' is no longer associated with 'a'
    expect(bidimap.reverseGet('beta')).toBe('a'); // 'beta' should now be associated with 'a'
  });

  it('iterates over an empty map correctly', () => {
    const bidimap = new BidirectionalMap<string, number>();
    expect([...bidimap]).toEqual([]);
  });

  it('iterates over a populated map correctly', () => {
    const bidimap = new BidirectionalMap<string, number>();
    bidimap.set('one', 1);
    bidimap.set('two', 2);
    bidimap.set('three', 3);

    const expectedEntries = [['one', 1], ['two', 2], ['three', 3]];
    expect([...bidimap]).toEqual(expectedEntries);
  });


  it('handles map mutation during iteration', () => {
    const bidimap = new BidirectionalMap<string, number>();
    bidimap.set('one', 1);
    bidimap.set('two', 2);

    const result: [string, number][] = [];
    for (const [key, value] of bidimap) {
      result.push([key, value]);
      if (key === 'one') {
        bidimap.set('three', 3); // Add during iteration
      }
    }

    const expectedEntries = [['one', 1], ['two', 2], ['three', 3]];
    expect(result).toEqual(expectedEntries);
  });
});
