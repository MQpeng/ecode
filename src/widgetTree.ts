import { Operation, OperationSource, OperationType } from './orchestration/operations';

export interface WidgetNode {
  id: string;
  children: string[];
  parent?: string;
}

export class WidgetTree {
  private nodes: Map<string, WidgetNode> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();
  private parentMap: Map<string, string> = new Map();

  constructor() {}

  private createOperation(type: OperationType, payload: any): Operation {
      return {
          source: OperationSource.WidgetTree,
          type,
          timestamp: Date.now(),
          payload,
      };
  }

  public addNode(node: WidgetNode, parentId?: string, record: boolean = true): Operation[] {
    const operations: Operation[] = [];
    const effectiveParentId = parentId || node.parent;

    if (effectiveParentId && this.nodes.has(effectiveParentId)) {
        const parentNode = this.nodes.get(effectiveParentId)!;
        const oldParentChildren = [...parentNode.children];
        
        if (!parentNode.children.includes(node.id)) {
            parentNode.children.push(node.id);
            this.adjacencyList.set(parentNode.id, parentNode.children);

            if (record) {
                operations.push(this.createOperation(OperationType.UpdateNode, {
                    id: parentNode.id,
                    updates: { children: [...parentNode.children] },
                    oldNode: { children: oldParentChildren },
                }));
            }
        }
        node.parent = parentNode.id;
    }
    
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, node.children ? [...node.children] : []);
    if (node.children) {
        node.children.forEach(childId => this.parentMap.set(childId, node.id));
    }

    if (record) {
        operations.push(this.createOperation(OperationType.AddNode, { node: { ...node } }));
    }
    
    return operations;
  }

  public getNode(id: string): WidgetNode | undefined {
    return this.nodes.get(id);
  }

  public deleteNode(id: string, record: boolean = true): Operation[] {
    const operations: Operation[] = [];
    const nodesToDelete: string[] = [];
    const queue: string[] = [id];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const currentNode = this.nodes.get(currentId);
        if (currentNode) {
            nodesToDelete.push(currentId);
            currentNode.children.forEach(childId => queue.push(childId));
        }
    }

    const initialNode = this.nodes.get(id);
    const parentId = initialNode?.parent;
    const parentNode = parentId ? this.nodes.get(parentId) : undefined;
    const oldParentChildren = parentNode ? [...parentNode.children] : undefined;

    for (const nodeId of nodesToDelete) {
        const nodeToDelete = this.nodes.get(nodeId);
        if (nodeToDelete) {
            if (record) {
                operations.push(this.createOperation(OperationType.DeleteNode, { deletedNode: { ...nodeToDelete } }));
            }
            this.parentMap.delete(nodeId);
            this.adjacencyList.delete(nodeId);
            this.nodes.delete(nodeId);
        }
    }

    if (parentNode && oldParentChildren) {
        parentNode.children = parentNode.children.filter(childId => childId !== id);
        this.adjacencyList.set(parentNode.id, parentNode.children);

        if (record) {
            operations.push(this.createOperation(OperationType.UpdateNode, {
                id: parentNode.id,
                updates: { children: [...parentNode.children] },
                oldNode: { children: oldParentChildren },
            }));
        }
    }

    return operations.reverse();
  }
  
  public updateNode(id: string, updates: Partial<WidgetNode>, record: boolean = true): Operation[] {
      const node = this.nodes.get(id);
      if (!node) return [];

      const oldNode = { ...node };
      const inverseChanges = Object.keys(updates).reduce((acc, key) => {
          acc[key] = oldNode[key];
          return acc;
      }, {});

      Object.assign(node, updates);

      if (record) {
          return [this.createOperation(OperationType.UpdateNode, {
              id,
              updates,
              oldNode: inverseChanges,
          })];
      }
      return [];
  }

  public replaceNode(id: string, newNode: WidgetNode, record: boolean = true): Operation[] {
    const oldNode = this.nodes.get(id);
    if (!oldNode) return [];

    this.deleteNode(id, false);
    this.addNode(newNode, newNode.parent, false);

    if (record) {
        return [this.createOperation(OperationType.ReplaceNode, { oldNode: { ...oldNode }, newNode: { ...newNode } })];
    }
    return [];
  }

  public copyNode(id: string): WidgetNode[] {
    const newNodes: WidgetNode[] = [];
    const idMap = new Map<string, string>();
    const newId = () => `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const copyRecursive = (originalId: string) => {
        const originalNode = this.nodes.get(originalId);
        if (!originalNode) return;

        const newGeneratedId = newId();
        idMap.set(originalId, newGeneratedId);

        const newNode: WidgetNode = {
            ...originalNode,
            id: newGeneratedId,
            parent: undefined, 
            children: originalNode.children.map(childId => {
                copyRecursive(childId);
                return idMap.get(childId)!;
            }),
        };
        newNodes.push(newNode);
    };

    copyRecursive(id);
    return newNodes;
  }

  public pasteNode(parentNodeId: string, copiedNodes: WidgetNode[], record: boolean = true): Operation[] {
    const parent = this.nodes.get(parentNodeId);
    if (!parent || !copiedNodes || copiedNodes.length === 0) {
        return [];
    }
    
    const nodesToPaste = copiedNodes.map(n => ({ ...n }));
    const idMap = new Map(nodesToPaste.map(n => [n.id, n]));
    const rootNode = nodesToPaste[nodesToPaste.length - 1]; // Root is the last one
    
    // Set internal parent pointers
    for (const node of nodesToPaste) {
      for (const childId of node.children) {
        const child = idMap.get(childId);
        if (child) {
          child.parent = node.id;
        }
      }
    }
    
    // Set the root's parent and update the parent's children
    rootNode.parent = parentNodeId;
    const oldParentChildren = [...parent.children];
    parent.children.push(rootNode.id);
    
    // Add all nodes to the tree state
    for (const node of nodesToPaste) {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, node.children);
      if (node.parent) {
        this.parentMap.set(node.id, node.parent);
      }
    }
    
    if (record) {
      return [this.createOperation(OperationType.PasteNode, {
        pastedNodes: nodesToPaste,
        parentNodeId: parentNodeId,
        oldParentChildren: oldParentChildren,
      })];
    }
    
    return [];
  }
}
