import { Widget, WidgetTreeIndex, WidgetTreeNode } from "./widget";

/**
 * Build a lookup map for a widget tree.
 *
 * This performs a depth-first traversal of the tree starting at `rootWidget`
 * and returns a mapping from node id to an index object containing the node
 * and its parent's id (pid). The index map is useful for O(1) lookups.
 *
 * @param {WidgetTreeNode} rootWidget - root of the widget tree
 * @returns {Record<string, WidgetTreeIndex>} mapping from node id to index info
 */
function buildIndexes(rootWidget: WidgetTreeNode): Record<string, WidgetTreeIndex>{
    const root: WidgetTreeIndex[] = [{pid: undefined, node: rootWidget}];
    const indexesMap: Record<string, WidgetTreeIndex> = {}
    while(root.length){
        const currentNode = root.pop()!;
        indexesMap[currentNode.node.id] = currentNode;
        if(currentNode.node.children && currentNode.node.children.length){
            for(const childNode of currentNode.node.children){
                root.push({pid: currentNode.node.id, node: childNode});
            }
        }
    }
    return indexesMap;
} 


/**
 * Exposes a small utility for querying and mutating a widget tree.
 *
 * The returned API operates on the provided `rootWidget` in-place and uses an
 * internal index map for O(1) lookups. Mutating operations rebuild the index
 * from the root to keep parent links consistent.
 *
 * @param {WidgetTreeNode} rootWidget - the root node of the tree to manage
 * @returns {{
 *   getWidgetById(id: string): Widget | null,
 *   getParentWidget(id: string): Widget | null,
 *   appendWidget(parentId: string, newWidgetNode: WidgetTreeNode): boolean,
 *   removeWidgetById(id: string): boolean
 * }} API for querying and mutating the tree
 */
export function usePageSructure(rootWidget: WidgetTreeNode){
    const INDEXES_MAP = buildIndexes(rootWidget);

    /**
     * Get the widget instance by its node id.
     * @param {string} id - node id to lookup
     * @returns {Widget | null}
     */
    function getWidgetById(id: string): Widget | null {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex) return null;
        return widgetIndex.node.widget;
    }

    /**
     * Get the parent widget of the node with the given id.
     * @param {string} id - child node id
     * @returns {Widget | null} parent widget or null if none
     */
    function getParentWidget(id: string): Widget | null {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex || !widgetIndex.pid) return null;
        const parentIndex = INDEXES_MAP[widgetIndex.pid];
        if(!parentIndex) return null;
        return parentIndex.node.widget;
    }

    /**
     * Append a new node as child of `parentId`.
     * Rebuilds the index map from the root to maintain correctness.
     *
     * @param {string} parentId - id of the parent node
     * @param {WidgetTreeNode} newWidgetNode - node to append
     * @returns {boolean} true if appended, false if parent not found
     */
    function appendWidget(parentId: string, newWidgetNode: WidgetTreeNode): boolean {
        const parentIndex = INDEXES_MAP[parentId];
        if(!parentIndex) return false;
        if(!parentIndex.node.children){
            parentIndex.node.children = [];
        }
        parentIndex.node.children.push(newWidgetNode);
        // Rebuild indexes from the full root to preserve parent links and remove stale entries
        const newMap = buildIndexes(rootWidget);
        for(const k in INDEXES_MAP){ delete INDEXES_MAP[k]; }
        Object.assign(INDEXES_MAP, newMap);
        return true;
    }

    /**
     * Remove the node with the given id from its parent.
     * Rebuilds the index map from the root to maintain correctness.
     *
     * @param {string} id - id of node to remove
     * @returns {boolean} true if removed, false otherwise
     */
    function removeWidgetById(id: string): boolean {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex || !widgetIndex.pid) return false;
        const parentIndex = INDEXES_MAP[widgetIndex.pid];
        if(!parentIndex || !parentIndex.node.children) return false;
        parentIndex.node.children = parentIndex.node.children.filter(child => child.id !== id);
        // Rebuild indexes from the full root to preserve parent links and remove stale entries
        const newMap = buildIndexes(rootWidget);
        for(const k in INDEXES_MAP){ delete INDEXES_MAP[k]; }
        Object.assign(INDEXES_MAP, newMap);
        return true;
    }

    return {
        getWidgetById,
        getParentWidget,
        appendWidget,
        removeWidgetById,
    }
}