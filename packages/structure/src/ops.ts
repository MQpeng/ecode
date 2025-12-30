import { TreeNode, Widget } from './types';
import { getGenerateIdFn, ensureUniqueId } from './id';
import { ModelRoot } from './model';
import { cloneDeep } from 'es-toolkit';

function findParentAndIndex(root: TreeNode, id: string): { parent: TreeNode | null; index: number } {
    if (root.id === id) return { parent: null, index: -1 };
    const stack: TreeNode[] = [root];
    while (stack.length) {
        const node = stack.pop()!;
        for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].id === id) return { parent: node, index: i };
            stack.push(node.children[i]);
        }
    }
    return { parent: null, index: -1 };
}

function findNodeById(root: TreeNode, id: string): TreeNode | null {
    const stack: TreeNode[] = [root];
    while (stack.length) {
        const node = stack.pop()!;
        if (node.id === id) return node;
        for (const c of node.children) stack.push(c);
    }
    return null;
}

export function append(model: ModelRoot, parentId: string, child: Widget | TreeNode, options?: { at?: number; idGen?: (w: Widget) => string }) {
    const rootCopy: TreeNode = cloneDeep(model.root);
    const parent = findNodeById(rootCopy, parentId);
    if (!parent) throw new Error(`Parent ${parentId} not found`);

    const idGen = options?.idGen ?? getGenerateIdFn(1);
    let nodeToInsert: TreeNode;
    if ((child as TreeNode).id) {
        nodeToInsert = cloneDeep(child as TreeNode);
        // ensure unique id
        const idSet = new Set(Array.from(new ModelRoot(rootCopy).idMap.keys()));
        nodeToInsert.id = ensureUniqueId(nodeToInsert.id, idSet);
    } else {
        const w = child as Widget;
        const newId = idGen(w);
        nodeToInsert = { id: newId, data: cloneDeep(w), children: [] };
    }

    const at = options?.at ?? parent.children.length;
    const clampedAt = Math.max(0, Math.min(at, parent.children.length));
    parent.children.splice(clampedAt, 0, nodeToInsert);
    return new ModelRoot(rootCopy);
}

export function replace(model: ModelRoot, id: string, newNode: Widget | TreeNode) {
    if (model.root.id === id) {
        // replacing root
        const newRoot = (newNode as TreeNode).id ? cloneDeep(newNode as TreeNode) : { id: model.root.id, data: cloneDeep(newNode as Widget), children: [] };
        // keep root id stable unless newNode provides id
        if (!(newNode as TreeNode).id) newRoot.id = model.root.id;
        return new ModelRoot(newRoot);
    }

    const rootCopy: TreeNode = cloneDeep(model.root);
    const { parent, index } = findParentAndIndex(rootCopy, id);
    if (!parent) throw new Error(`Node ${id} not found`);

    const replacement = (newNode as TreeNode).id ? cloneDeep(newNode as TreeNode) : { id, data: cloneDeep(newNode as Widget), children: [] };
    parent.children.splice(index, 1, replacement);
    return new ModelRoot(rootCopy);
}

export function remove(model: ModelRoot, id: string) {
    if (model.root.id === id) throw new Error(`Cannot remove root node`);
    const rootCopy: TreeNode = cloneDeep(model.root);
    const { parent, index } = findParentAndIndex(rootCopy, id);
    if (!parent) throw new Error(`Node ${id} not found`);
    parent.children.splice(index, 1);
    return new ModelRoot(rootCopy);
}

function isDescendant(root: TreeNode, ancestorId: string, descendantId: string) {
    const stack: TreeNode[] = [root];
    while (stack.length) {
        const node = stack.pop()!;
        if (node.id === ancestorId) {
            // search descendant in this subtree
            const s: TreeNode[] = [node];
            while (s.length) {
                const n = s.pop()!;
                if (n.id === descendantId) return true;
                for (const c of n.children) s.push(c);
            }
            return false;
        }
        for (const c of node.children) stack.push(c);
    }
    return false;
}

export function move(model: ModelRoot, id: string, newParentId: string, at?: number) {
    if (id === model.root.id) throw new Error('Cannot move root');
    if (isDescendant(model.root, id, newParentId)) throw new Error('Cannot move a node into its descendant');

    const rootCopy: TreeNode = cloneDeep(model.root);
    const { parent: fromParent, index } = findParentAndIndex(rootCopy, id);
    if (!fromParent) throw new Error(`Node ${id} not found`);
    const node = fromParent.children.splice(index, 1)[0];

    const toParent = findNodeById(rootCopy, newParentId);
    if (!toParent) throw new Error(`New parent ${newParentId} not found`);

    const insertAt = at ?? toParent.children.length;
    toParent.children.splice(insertAt, 0, node);
    return new ModelRoot(rootCopy);
}
