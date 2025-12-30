import { describe, it, expect } from 'vitest';
import { ModelRoot } from '../src/model';
import { append, replace, remove, move } from '../src/ops';
import { getGenerateIdFn } from '../src/id';
import type { TreeNode } from '../src/types';

describe('Ops', () => {
    const root: TreeNode = {
        id: 'root',
        data: { type: 'Page', name: 'p', props: {}, events: {} },
        children: [
            { id: 'a', data: { type: 'A', name: 'a', props: {}, events: {} }, children: [] },
            { id: 'b', data: { type: 'B', name: 'b', props: {}, events: {} }, children: [] },
        ],
    };

    it('append adds child', () => {
        const model = new ModelRoot(root);
        const newModel = append(model, 'root', { type: 'C', name: 'c', props: {}, events: {} }, { idGen: getGenerateIdFn(1) });
        expect(newModel.findById('root')?.children.length).toBe(3);
        expect(newModel.findById('C_1')).not.toBeNull();
        // original unchanged
        expect(model.findById('root')?.children.length).toBe(2);
    });

    it('replace swaps node', () => {
        const model = new ModelRoot(root);
        const newModel = replace(model, 'a', { type: 'A2', name: 'a2', props: {}, events: {} });
        expect(newModel.findById('a')?.data.type).toBe('A2');
    });

    it('remove deletes node', () => {
        const model = new ModelRoot(root);
        const newModel = remove(model, 'b');
        expect(newModel.findById('b')).toBeNull();
        expect(model.findById('b')).not.toBeNull();
    });

    it('move moves node between parents', () => {
        const tree: TreeNode = {
            id: 'r',
            data: { type: 'R', name: 'r', props: {}, events: {} },
            children: [
                { id: 'p1', data: { type: 'P', name: 'p1', props: {}, events: {} }, children: [{ id: 'x', data: { type: 'X', name: 'x', props: {}, events: {} }, children: [] }] },
                { id: 'p2', data: { type: 'P', name: 'p2', props: {}, events: {} }, children: [] },
            ],
        };
        const model = new ModelRoot(tree);
        const newModel = move(model, 'x', 'p2');
        expect(newModel.findById('p2')?.children.length).toBe(1);
        expect(newModel.findById('p1')?.children.length).toBe(0);
    });

    it('move into descendant is rejected', () => {
        const tree: TreeNode = {
            id: 'r',
            data: { type: 'R', name: 'r', props: {}, events: {} },
            children: [
                { id: 'p1', data: { type: 'P', name: 'p1', props: {}, events: {} }, children: [{ id: 'x', data: { type: 'X', name: 'x', props: {}, events: {} }, children: [] }] },
            ],
        };
        const model = new ModelRoot(tree);
        expect(() => move(model, 'p1', 'x')).toThrow();
    });

    it('cannot remove root', () => {
        const model = new ModelRoot(root);
        expect(() => remove(model, 'root')).toThrow();
    });
});
