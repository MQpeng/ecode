/**
 * Describes an event that a widget can emit or handle.
 */
export interface WidgetEvent {
    label: string;
    params: string[];
    handler: string;
    compiledHandler?: string;
    description?: string;
}

/**
 * Basic widget shape used in the widget tree.
 */
export interface Widget {
    id: string;
    type: string;
    name?: string;
    classNames?:string[];
    style?:string;
    properties?: Record<string, unknown>;
    events?:Record<string,WidgetEvent>;
    renderFunction?: string;
    directives?: Record<string, WidgetEvent>;
}

/**
 * A node in the widget tree with optional children.
 */
export interface WidgetTreeNode {
    id: string;
    type: string;
    widget: Widget;
    children?: WidgetTreeNode[];
}

/**
 * An index entry mapping a node id to its parent id and node.
 */
export interface WidgetTreeIndex {
    pid?: string;
    node: WidgetTreeNode;
}

/**
 * Build an index mapping node id to its WidgetTreeIndex (parent id + node).
 * This performs a DFS traversal starting from the root and returns a lookup object.
 */
export function buildIndexes(rootWidget: WidgetTreeNode): Record<string, WidgetTreeIndex>{
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
 * Utility for navigating and mutating a widget tree.
 * - `getWidgetById`: returns widget or null
 * - `getParentWidget`: returns parent widget or null
 * - `appendWidget`: append child to parent by id, rebuilds index
 * - `removeWidgetById`: remove node from its parent by id, rebuilds index
 */
export function usePageSructure(rootWidget: WidgetTreeNode){
    let INDEXES_MAP = buildIndexes(rootWidget);

    function getWidgetById(id: string) {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex) return null;
        return widgetIndex.node.widget;
    }

    function getParentWidget(id: string) {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex || !widgetIndex.pid) return null;
        const parentIndex = INDEXES_MAP[widgetIndex.pid];
        if(!parentIndex) return null;
        return parentIndex.node.widget;
    }

    function appendWidget(parentId: string, newWidgetNode: WidgetTreeNode): boolean {
        const parentIndex = INDEXES_MAP[parentId];
        if(!parentIndex) return false;
        if(!parentIndex.node.children){
            parentIndex.node.children = [];
        }
        parentIndex.node.children.push(newWidgetNode);
        INDEXES_MAP = buildIndexes(rootWidget);
        return true;
    }

    function removeWidgetById(id: string): boolean {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex || !widgetIndex.pid) return false;
        const parentIndex = INDEXES_MAP[widgetIndex.pid];
        if(!parentIndex || !parentIndex.node.children) return false;
        parentIndex.node.children = parentIndex.node.children.filter(child => child.id !== id);
        INDEXES_MAP = buildIndexes(rootWidget);
        return true;
    }

    return {
        getWidgetById,
        getParentWidget,
        appendWidget,
        removeWidgetById,
    }
}
