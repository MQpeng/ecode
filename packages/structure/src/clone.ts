import { TreeNode, Widget } from './types';
import { getGenerateIdFn } from './id';
import { cloneDeep } from 'es-toolkit';

export function deepCloneNode<T extends Widget>(node: TreeNode<T>, remapIds = true, idGen: (w: T) => string = getGenerateIdFn(1)) {
    const idMap = new Map<string, string>();

    function clone(n: TreeNode<T>): TreeNode<T> {
        const newId = remapIds ? idGen(n.data) : n.id;
        if (remapIds) idMap.set(n.id, newId);

        const clonedData = {
            ...n.data,
            props: n.data.props ? cloneDeep(n.data.props) : {},
            events: n.data.events ? cloneDeep(n.data.events) : {},
        } as T;

        const newChildren = n.children.map(clone);
        return { id: newId, data: clonedData, children: newChildren };
    }

    const newRoot = clone(node);
    return { node: newRoot, idMap };
}
