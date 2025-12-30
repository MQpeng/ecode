import { TreeNode, Widget } from './types';
import { deepCloneNode } from './clone';
import { cloneDeep } from 'es-toolkit';

type NodeRef<T extends Widget = Widget> = { node: TreeNode<T>; parentId?: string | null; index: number };

export class ModelRoot {
    root: TreeNode;
    idMap: Map<string, NodeRef>;

    constructor(root: TreeNode) {
        this.root = root;
        this.idMap = new Map();
        this.buildIndex(root, null);
    }

    private buildIndex(node: TreeNode, parentId: string | null) {
        if (this.idMap.has(node.id)) {
            throw new Error(`Duplicate id detected: ${node.id}`);
        }
        const index = parentId === null ? 0 : (this.idMap.get(parentId)?.index ?? 0);
        this.idMap.set(node.id, { node, parentId, index });
        node.children.forEach((ch, i) => this.buildIndex(ch, node.id));
    }

    findById(id: string): TreeNode | null {
        const ref = this.idMap.get(id);
        return ref ? ref.node : null;
    }

    toObject() {
        // shallow serialization-friendly copy
        return cloneDeep(this.root);
    }

    clone(remapIds = false, idGen?: (w: Widget) => string) {
        if (remapIds) {
            const gen = idGen ?? (w => w.type + '_' + Math.random().toString(36).slice(2));
            const { node, idMap } = deepCloneNode(this.root, true, gen as any);
            return { model: new ModelRoot(node), idMap };
        }
        // deep clone without remapping ids
        const cloneRoot: TreeNode = cloneDeep(this.root);
        return { model: new ModelRoot(cloneRoot), idMap: new Map<string, string>() };
    }
}
