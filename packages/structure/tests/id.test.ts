import { describe, it, expect } from 'vitest';
import { getGenerateIdFn, ensureUniqueId, remapIds } from '../src/id';
import { TreeNode } from '../src/types';

describe('id helpers', () => {
    it('getGenerateIdFn is deterministic', () => {
        const gen = getGenerateIdFn(10);
        const w = { type: 'X', name: 'x', props: {}, events: {} };
        expect(gen(w)).toBe('X_10');
        expect(gen(w)).toBe('X_11');
    });

    it('ensureUniqueId appends suffix when needed', () => {
        const set = new Set<string>(['a', 'b']);
        const id = ensureUniqueId('a', set);
        expect(id).not.toBe('a');
        expect(set.has(id)).toBeTruthy();
    });

    it('remapIds remaps all ids and returns mapping', () => {
        const root: TreeNode = {
            id: 'r',
            data: { type: 'Root', name: 'r', props: {}, events: {} },
            children: [
                { id: 'c1', data: { type: 'C', name: 'c1', props: {}, events: {} }, children: [] },
            ],
        };
        const gen = getGenerateIdFn(1);
        const { root: newRoot, idMap } = remapIds(root, gen);
        expect(newRoot.id).not.toBe('r');
        expect(idMap.size).toBe(2);
        expect(idMap.has('r')).toBeTruthy();
        expect(idMap.has('c1')).toBeTruthy();
    });
});
