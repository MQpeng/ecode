import { describe, it, expect } from 'vitest';
import { ModelRoot } from '../src/model';
import { toJSON, fromJSON } from '../src/serializer';
import type { TreeNode } from '../src/types';

describe('serializer', () => {
    it('roundtrips model to JSON and back', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: { p: 1 }, events: {} }, children: [] };
        const model = new ModelRoot(root);
        const json = toJSON(model);
        const model2 = fromJSON(json);
        expect(model2.findById('r')?.data.props).toEqual({ p: 1 });
    });
});
