import { describe, it, expect } from 'vitest';
import { ModelRoot } from '../src/model';
import { append } from '../src/ops';
import { getGenerateIdFn } from '../src/id';
import type { TreeNode } from '../src/types';

describe('Ops edge cases', () => {
    it('append with node having duplicate id gets deduped', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [] };
        const model = new ModelRoot(root);
        const node = { id: 'r', data: { type: 'R', name: 'dup', props: {}, events: {} }, children: [] };
        const newModel = append(model, 'r', node as any, { idGen: getGenerateIdFn(1) });
        // inserted child id should not equal 'r'
        const child = newModel.findById('r')!.children[0];
        expect(child.id).not.toBe('r');
    });

    it('append with negative at clamps to 0', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [{ id: 'a', data: { type: 'A', name: 'a', props: {}, events: {} }, children: [] }] };
        const model = new ModelRoot(root);
        const newModel = append(model, 'r', { type: 'B', name: 'b', props: {}, events: {} }, { at: -5, idGen: getGenerateIdFn(1) });
        expect(newModel.findById('r')?.children[0].data.type).toBe('B');
    });

    it('append with large at clamps to end', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [{ id: 'a', data: { type: 'A', name: 'a', props: {}, events: {} }, children: [] }] };
        const model = new ModelRoot(root);
        const newModel = append(model, 'r', { type: 'B', name: 'b', props: {}, events: {} }, { at: 100, idGen: getGenerateIdFn(1) });
        expect(newModel.findById('r')?.children.length).toBe(2);
        expect(newModel.findById('r')?.children[1].data.type).toBe('B');
    });
});
