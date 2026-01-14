import { describe, it, expect, beforeEach } from 'vitest';
import { AppOrchestrator } from '../orchestration/appOrchestrator';
import { WidgetTree, WidgetNode } from '../widgetTree';
import { WidgetMetaStore, WidgetMeta } from '../widgetMeta';

// Helper to create a simple node
const makeNode = (id: string, children: string[] = [], parent: string | null = null): WidgetNode => ({
  id,
  children,
  parent,
});

// Helper to create simple meta
const makeMeta = (id:string): WidgetMeta => ({
    id,
    properties: { text: `Properties for ${id}` },
    events: {},
});

describe('AppOrchestrator Integration Tests', () => {
  let widgetTree: WidgetTree;
  let widgetMetaStore: WidgetMetaStore;
  let orchestrator: AppOrchestrator;

  beforeEach(() => {
    widgetTree = new WidgetTree();
    widgetMetaStore = new WidgetMetaStore();
    orchestrator = new AppOrchestrator(widgetTree, widgetMetaStore);
  });

  describe('WidgetTree Operations', () => {
    it('should add a node and then undo/redo the addition', () => {
      const node = makeNode('node1');
      orchestrator.addNode(node);
      expect(orchestrator.widgetTree.getNode('node1')).toEqual(node);

      orchestrator.undo();
      expect(orchestrator.widgetTree.getNode('node1')).toBeUndefined();

      orchestrator.redo();
      expect(orchestrator.widgetTree.getNode('node1')).toEqual(node);
    });

    it('should delete a node and then undo/redo the deletion', () => {
      const parent = makeNode('parent', ['child']);
      const child = makeNode('child', [], 'parent');
      orchestrator.addNode(parent);
      orchestrator.addNode(child); // THIS IS THE FIX
      // Clear transactions from setup
      orchestrator['undoManager']['undoStack'] = [];

      orchestrator.deleteNode('child');
      expect(orchestrator.widgetTree.getNode('child')).toBeUndefined();
      expect(orchestrator.widgetTree.getNode('parent')?.children).not.toContain('child');

      orchestrator.undo();
      expect(orchestrator.widgetTree.getNode('child')).toBeDefined();
      expect(orchestrator.widgetTree.getNode('parent')?.children).toContain('child');

      orchestrator.redo();
      expect(orchestrator.widgetTree.getNode('child')).toBeUndefined();
      expect(orchestrator.widgetTree.getNode('parent')?.children).not.toContain('child');
    });
    
    it('should update a node and then undo/redo the update', () => {
        const node = makeNode('node1');
        orchestrator.addNode(node);

        const updates = { parent: 'new-parent' };
        orchestrator.updateNode('node1', updates);
        expect(orchestrator.widgetTree.getNode('node1')?.parent).toBe('new-parent');

        orchestrator.undo();
        expect(orchestrator.widgetTree.getNode('node1')?.parent).toBeNull();
        
        orchestrator.redo();
        expect(orchestrator.widgetTree.getNode('node1')?.parent).toBe('new-parent');
    });

    it('should replace a node and then undo/redo the replacement', () => {
        const oldNode = makeNode('old-node');
        orchestrator.addNode(oldNode);

        const newNode = makeNode('new-node');
        orchestrator.replaceNode('old-node', newNode);
        expect(orchestrator.widgetTree.getNode('old-node')).toBeUndefined();
        expect(orchestrator.widgetTree.getNode('new-node')).toBeDefined();

        orchestrator.undo();
        expect(orchestrator.widgetTree.getNode('new-node')).toBeUndefined();
        expect(orchestrator.widgetTree.getNode('old-node')).toBeDefined();

        orchestrator.redo();
        expect(orchestrator.widgetTree.getNode('old-node')).toBeUndefined();
        expect(orchestrator.widgetTree.getNode('new-node')).toBeDefined();
    });
  });

  describe('WidgetMetaStore Operations', () => {
    it('should add meta and then undo/redo the addition', () => {
      const meta = makeMeta('meta1');
      orchestrator.addMeta(meta);
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toEqual(meta);

      orchestrator.undo();
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toBeUndefined();

      orchestrator.redo();
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toEqual(meta);
    });

    it('should update meta and then undo/redo the update', () => {
        const meta = makeMeta('meta1');
        orchestrator.addMeta(meta);

        const updates = { properties: { text: 'Updated Properties' } };
        orchestrator.updateMeta('meta1', updates);
        expect(orchestrator.widgetMetaStore.getMeta('meta1')?.properties.text).toBe('Updated Properties');

        orchestrator.undo();
        expect(orchestrator.widgetMetaStore.getMeta('meta1')?.properties.text).toBe('Properties for meta1');
        
        orchestrator.redo();
        expect(orchestrator.widgetMetaStore.getMeta('meta1')?.properties.text).toBe('Updated Properties');
    });

     it('should delete meta and then undo/redo the deletion', () => {
      const meta = makeMeta('meta1');
      orchestrator.addMeta(meta);
      
      orchestrator.deleteMeta('meta1');
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toBeUndefined();

      orchestrator.undo();
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toEqual(meta);

      orchestrator.redo();
      expect(orchestrator.widgetMetaStore.getMeta('meta1')).toBeUndefined();
    });
  });
  
  describe('Complex Operations: Copy and Paste', () => {
    beforeEach(() => {
        orchestrator.addNode(makeNode('root', ['child1']));
        orchestrator.addNode(makeNode('child1', ['grandchild1'], 'root'));
        orchestrator.addNode(makeNode('grandchild1', [], 'child1'));
        orchestrator.addNode(makeNode('paste-target'));
        // Clear transactions from setup
        orchestrator['undoManager']['undoStack'] = [];
    });

    it('should copy and paste a subtree, then undo/redo the paste', () => {
        const copiedNodes = orchestrator.copyNode('child1');
        const copiedRootNode = copiedNodes[copiedNodes.length - 1];
        const copiedChildNode = copiedNodes[0];

        orchestrator.pasteNode('paste-target', copiedNodes);
        
        const pasteTarget = orchestrator.widgetTree.getNode('paste-target');
        expect(pasteTarget?.children).toContain(copiedRootNode.id);
        const pastedRoot = orchestrator.widgetTree.getNode(copiedRootNode.id);
        expect(pastedRoot?.parent).toBe('paste-target');
        expect(orchestrator.widgetTree.getNode(copiedChildNode.id)?.parent).toBe(pastedRoot?.id);

        orchestrator.undo();
        
        expect(orchestrator.widgetTree.getNode('paste-target')?.children).not.toContain(copiedRootNode.id);
        expect(orchestrator.widgetTree.getNode(copiedRootNode.id)).toBeUndefined();
        expect(orchestrator.widgetTree.getNode(copiedChildNode.id)).toBeUndefined();
        
        orchestrator.redo();

        expect(orchestrator.widgetTree.getNode('paste-target')?.children).toContain(copiedRootNode.id);
        const redoneRoot = orchestrator.widgetTree.getNode(copiedRootNode.id);
        expect(redoneRoot).toBeDefined();
        expect(redoneRoot?.parent).toBe('paste-target');
    });
  });

  describe('Undo/Redo Stack Behavior', () => {
      it('should clear the redo stack upon a new action', () => {
          orchestrator.addNode(makeNode('node1'));
          orchestrator.addNode(makeNode('node2'));
          
          orchestrator.undo(); 
          
          orchestrator.addNode(makeNode('node3'));

          orchestrator.redo();
          expect(orchestrator.widgetTree.getNode('node2')).toBeUndefined();
      });
  });
});
