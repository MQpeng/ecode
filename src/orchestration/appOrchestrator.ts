import { WidgetNode } from "../widgetTree";
import { WidgetMeta, WidgetMetaStore } from "../widgetMeta";
import { UndoManager } from "./undoManager";
import { Operation } from "./operations";
import { WidgetTree } from "../widgetTree";

/**
 * The central orchestrator for the application.
 * It is the single source of truth for state modifications and manages the undo/redo functionality.
 * All write operations to the WidgetTree or WidgetMetaStore should go through this class.
 */
export class AppOrchestrator {
  private undoManager: UndoManager;

  constructor(
    public widgetTree: WidgetTree,
    public widgetMetaStore: WidgetMetaStore
  ) {
    this.undoManager = new UndoManager(this.widgetTree, this.widgetMetaStore);
  }

  /**
   * Executes a transaction, records it, and adds it to the undo stack.
   * @param execute A function that returns an array of operations.
   */
  private executeTransaction(execute: () => Operation[]) {
    const operations = execute();
    if (operations && operations.length > 0) {
        this.undoManager.addTransaction(operations);
    }
  }

  // --- WidgetTree Public API ---

  addNode(node: WidgetNode, parentId?: string) {
    this.executeTransaction(() => this.widgetTree.addNode(node, parentId));
  }

  deleteNode(nodeId: string) {
    this.executeTransaction(() => this.widgetTree.deleteNode(nodeId));
  }
  
  updateNode(nodeId: string, updates: Partial<WidgetNode>) {
    this.executeTransaction(() => this.widgetTree.updateNode(nodeId, updates));
  }

  replaceNode(id: string, newNode: WidgetNode) {
    this.executeTransaction(() => this.widgetTree.replaceNode(id, newNode));
  }

  /**
   * Pastes a copied node (and its children) into the tree.
   * @param parentNodeId The ID of the node to paste into.
   * @param copiedNodes An array of WidgetNodes to be pasted. This should be the output of `copyNode`.
   */
  pasteNode(parentNodeId: string, copiedNodes: WidgetNode[]) {
    this.executeTransaction(() => this.widgetTree.pasteNode(parentNodeId, copiedNodes));
  }
  
  copyNode(nodeId: string): WidgetNode[] {
    return this.widgetTree.copyNode(nodeId);
  }

  // --- WidgetMetaStore Public API ---

  addMeta(meta: WidgetMeta) {
    this.executeTransaction(() => this.widgetMetaStore.addMeta(meta));
  }

  deleteMeta(metaId: string) {
    this.executeTransaction(() => this.widgetMetaStore.deleteMeta(metaId));
  }

  updateMeta(metaId: string, updates: Partial<WidgetMeta>) {
    this.executeTransaction(() => this.widgetMetaStore.updateMeta(metaId, updates));
  }

  // --- Undo/Redo Public API ---

  undo() {
    this.undoManager.undo();
  }

  redo() {
    this.undoManager.redo();
  }
}
