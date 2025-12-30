import { describe, it, expect } from 'vitest';
import { getGenerateIdFn, Widget, TreeNode } from '../src/widget';

describe('core types and id generator', () => {
    it('generates deterministic ids with seed', () => {
        const gen = getGenerateIdFn(1);
        const w: Widget = { type: 'Box', name: 'b', props: {}, events: {} };
        expect(gen(w)).toBe('Box_1');
        expect(gen(w)).toBe('Box_2');
    });

    it('TreeNode shape can be constructed', () => {
        const node: TreeNode = { id: 'root', data: { type: 'Page', name: 'p', props: {}, events: {} }, children: [] };
        expect(node.id).toBe('root');
        expect(node.data.type).toBe('Page');
    });
});
