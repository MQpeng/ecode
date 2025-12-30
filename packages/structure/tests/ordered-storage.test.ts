import { describe, it, expect } from 'vitest';
import { ArrayStorage } from '../src/tree/ordered-storage';

describe('ArrayStorage', () => {
    it('supports insert/remove/get/indexOf/size', () => {
        const s = new ArrayStorage<number>([1, 2]);
        s.insert(1, 9);
        expect(s.toArray()).toEqual([1, 9, 2]);
        expect(s.get(1)).toBe(9);
        expect(s.indexOf(2)).toBe(2);
        expect(s.remove(1)).toBe(9);
        expect(s.size()).toBe(2);
    });
});
