import { useConfig } from "./config";
import { useInteraction } from "./interaction";
import { usePageSructure, Widget, WidgetTreeNode } from "./structure";

export function createRootWidget(widget: Widget): WidgetTreeNode {
    return { id: widget.id, type: widget.type, widget, children: [] };
}

export function useOps(rootWidget: WidgetTreeNode) {
    const {
        getWidgetById,
        getParentWidget,
        appendWidget,
        removeWidgetById,
    } = usePageSructure(rootWidget);

    const {
        interactionRelationship,
        addInteractionMeta,
        getInteractionMeta,
        removeInteractionMeta,
    } = useInteraction();

    const {
        loader,
        compiler,
        configMetaList,
        addConfigMeta,
        compile,
    } = useConfig();

    return {
        getWidgetById,
        getParentWidget,
        appendWidget,
        removeWidgetById,
        interactionRelationship,
        addInteractionMeta,
        getInteractionMeta,
        removeInteractionMeta,
        loader,
        compiler,
        configMetaList,
        addConfigMeta,
        compile,
    }
}