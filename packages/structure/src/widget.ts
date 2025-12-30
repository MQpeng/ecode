import { Event, Widget, TreeNode } from './types';
import { getGenerateIdFn } from './id';

export { Event, Widget, TreeNode, getGenerateIdFn };

export function useWidget(rootWidget: Widget, generateIdFn = getGenerateIdFn()) {
    const rootId = generateIdFn(rootWidget);
    const rootWidgetTree: TreeNode = {
        id: rootId,
        data: rootWidget,
        children: [],
    };

    function appendChild(){

    }

    function removeChild(){

    }

    function findWidgetById(id: string): TreeNode | null {
        return null;
    }

}
