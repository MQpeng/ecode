import { describe, it, expect } from 'vitest';
import { deepCloneNode } from '../src/clone';
import { getGenerateIdFn } from '../src/id';

import type { TreeNode } from '../src/types';

describe('deepCloneNode', () => {
    it('clones subtree and remaps ids', () => {
        const root: TreeNode = {
            id: 'r',
            data: { type: 'Root', name: 'r', props: { a: { b: 1 } }, events: {} },
            children: [
                { id: 'c1', data: { type: 'C', name: 'c1', props: { v: 2 }, events: {} }, children: [] },
            ],
        };
        const gen = getGenerateIdFn(100);
        const { node: clone, idMap } = deepCloneNode(root, true, gen);
        expect(clone.id).not.toBe(root.id);
        expect(idMap.size).toBe(2);
        expect(clone.children.length).toBe(1);
        // deep clone props
        expect(clone.data.props).toEqual(root.data.props);
        // ensure it's a different reference
        (clone.data.props as any).a.b = 999;
        expect((root.data.props as any).a.b).toBe(1);
    });

    it('clones without remapping ids when remapIds=false', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [] };
        const { node: clone, idMap } = deepCloneNode(root, false);
        expect(clone.id).toBe('r');
        expect(idMap.size).toBe(0);
    });
});
