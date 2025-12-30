import { Widget, WidgetTreeIndex, WidgetTreeNode } from "./widget";

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


export function usePageSructure(rootWidget: WidgetTreeNode){
    const INDEXES_MAP = buildIndexes(rootWidget);

    function getWidgetById(id: string): Widget | null {
        const widgetIndex = INDEXES_MAP[id];
        if(!widgetIndex) return null;
        return widgetIndex.node.widget;
    }

    function getParentWidget(id: string): Widget | null {
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
        // Rebuild indexes from the full root to preserve parent links and remove stale entries
        const newMap = buildIndexes(rootWidget);
        for(const k in INDEXES_MAP){ delete INDEXES_MAP[k]; }
        Object.assign(INDEXES_MAP, newMap);
        return true;
    }

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