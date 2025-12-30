import { describe, it } from 'vitest';
import { ModelRoot } from '../src/model';
import { append } from '../src/ops';
import { getGenerateIdFn } from '../src/id';
import type { TreeNode } from '../src/types';

// This is a skipped/optional perf test. It is marked skip so it doesn't run in CI by default.
describe.skip('perf: large tree operations', () => {
    it('bulk append performance', () => {
        const root: TreeNode = { id: 'r', data: { type: 'R', name: 'r', props: {}, events: {} }, children: [] };
        let model = new ModelRoot(root);
        const gen = getGenerateIdFn(1);
        for (let i = 0; i < 10000; i++) {
            model = append(model, 'r', { type: 'N', name: `n${i}`, props: {}, events: {} }, { idGen: gen });
        }
        // No assertion: this is a benchmark scaffold only
    });
});
