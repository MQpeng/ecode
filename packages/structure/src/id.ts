import { Widget, TreeNode } from './types';

export function getGenerateIdFn(initialIdx = 1) {
    let idx = initialIdx;
    return (item: Widget) => [item.type, idx++].join('_');
}

export function ensureUniqueId(id: string, idSet: Set<string>): string {
    let candidate = id;
    let i = 1;
    while (idSet.has(candidate)) {
        candidate = `${id}_${i++}`;
    }
    idSet.add(candidate);
    return candidate;
}

export function remapIds<T extends Widget>(root: TreeNode<T>, genFn: (w: T) => string): { root: TreeNode<T>; idMap: Map<string, string> } {
    const idMap = new Map<string, string>();

    function cloneNode(node: TreeNode<T>): TreeNode<T> {
        const newId = genFn(node.data);
        idMap.set(node.id, newId);
        const newChildren = node.children.map(cloneNode);
        return {
            id: newId,
            data: { ...node.data },
            children: newChildren,
        };
    }

    const newRoot = cloneNode(root);
    return { root: newRoot, idMap };
}
