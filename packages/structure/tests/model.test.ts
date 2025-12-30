import { describe, it, expect } from 'vitest';
import { ModelRoot } from '../src/model';
import { getGenerateIdFn } from '../src/id';

import type { TreeNode } from '../src/types';

describe('ModelRoot', () => {
    it('builds idMap and findById works', () => {
        const root: TreeNode = {
            id: 'r',
            data: { type: 'Root', name: 'r', props: {}, events: {} },
            children: [
                { id: 'c1', data: { type: 'C', name: 'c1', props: {}, events: {} }, children: [] },
            ],
        };
        const model = new ModelRoot(root);
        expect(model.findById('r')?.id).toBe('r');
        expect(model.findById('c1')?.id).toBe('c1');
    });

    it('clone without remap keeps ids and is deep copy', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: { x: 1 }, events: {} }, children: [] };
        const model = new ModelRoot(root);
        const { model: cloned } = model.clone(false);
        expect(cloned.findById('r')).not.toBeNull();
        // ensure deep copy
        (cloned.findById('r')!.data.props as any).x = 9;
        expect((model.findById('r')!.data.props as any).x).toBe(1);
    });

    it('clone with remap gives new ids and idMap', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [] };
        const model = new ModelRoot(root);
        const gen = getGenerateIdFn(50);
        const { model: cloned, idMap } = model.clone(true, gen as any);
        expect(idMap.size).toBe(1);
        expect(cloned.findById('r')).toBeNull();
    });

    it('throws on duplicate ids', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [{ id: 'r', data: { type: 'C', name: 'c', props: {}, events: {} }, children: [] }] };
        expect(() => new ModelRoot(root)).toThrow();
    });
});
