import { Operation, OperationSource, OperationType } from "./operations";
import { WidgetTree } from "../widgetTree";
import { WidgetMetaStore } from "../widgetMeta";

/**
 * Manages the undo and redo stacks for application state changes.
 */
export class UndoManager {
  private undoStack: Operation[][] = [];
  private redoStack: Operation[][] = [];

  constructor(
    private widgetTree: WidgetTree,
    private widgetMetaStore: WidgetMetaStore
  ) {}

  public addTransaction(operations: Operation[]): void {
    if (operations.length > 0) {
      this.undoStack.push(operations);
      this.redoStack = []; // A new action clears the redo history
    }
  }

  public undo(): void {
    const transaction = this.undoStack.pop();
    if (!transaction) return;

    for (let i = transaction.length - 1; i >= 0; i--) {
      this.applyOperation(transaction[i], true);
    }

    this.redoStack.push(transaction);
  }

  public redo(): void {
    const transaction = this.redoStack.pop();
    if (!transaction) return;

    transaction.forEach(op => this.applyOperation(op, false));
    this.undoStack.push(transaction);
  }

  private applyOperation(op: Operation, isInverse: boolean): void {
    const { source, type, payload } = op;

    if (source === OperationSource.WidgetTree) {
        const tree = this.widgetTree;
        switch (type) {
            case OperationType.AddNode:
                isInverse ? tree.deleteNode(payload.node.id, false) : tree.addNode(payload.node, payload.node.parent, false);
                break;
            case OperationType.DeleteNode:
                isInverse ? tree.addNode(payload.deletedNode, payload.deletedNode.parent, false) : tree.deleteNode(payload.deletedNode.id, false);
                break;
            case OperationType.UpdateNode:
                isInverse ? tree.updateNode(payload.id, payload.oldNode, false) : tree.updateNode(payload.id, payload.updates, false);
                break;
            case OperationType.ReplaceNode:
                isInverse ? tree.replaceNode(payload.newNode.id, payload.oldNode, false) : tree.replaceNode(payload.oldNode.id, payload.newNode, false);
                break;
            case OperationType.PasteNode:
                if (isInverse) {
                    // Undo a paste by deleting the root of the pasted subtree.
                    const rootNodeId = payload.pastedNodes[payload.pastedNodes.length - 1].id;
                    tree.deleteNode(rootNodeId, false);
                } else {
                    // Redo a paste by re-pasting the nodes.
                    tree.pasteNode(payload.parentNodeId, payload.pastedNodes, false);
                }
                break;
        }
    } else if (source === OperationSource.WidgetMeta) {
        const store = this.widgetMetaStore;
        switch (type) {
            case OperationType.AddMeta:
                isInverse ? store.deleteMeta(payload.meta.id, false) : store.addMeta(payload.meta, false);
                break;
            case OperationType.DeleteMeta:
                isInverse ? store.addMeta(payload.deletedMeta, false) : store.deleteMeta(payload.deletedMeta.id, false);
                break;
            case OperationType.UpdateMeta:
                isInverse ? store.updateMeta(payload.id, payload.oldMeta, false) : store.updateMeta(payload.id, payload.updates, false);
                break;
        }
    }
  }
}
