export interface WidgetEvent {
    label: string;
    params: string[];
    handler: string;
    compiledHandler?: string;
    description?: string;
}

export interface Widget {
    id: string;
    type: string;
    name?: string;
    classNames?:string[];
    style?:string;
    properties?: Record<string, any>;
    events?:Record<string,WidgetEvent>;
    renderFunction?: string;
    directives?: Record<string, WidgetEvent>;
}

export interface WidgetTreeNode {
    id: string;
    type: string;
    widget: Widget;
    children?: WidgetTreeNode[];
}

export interface WidgetTreeIndex {
    pid?: string;
    node: WidgetTreeNode;
}

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
