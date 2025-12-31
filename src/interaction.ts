/**
 * Interaction metadata describing a UI or domain interaction point.
 */
export interface InteractionMeta {
    label: string;
    eventName: string;
    trigger: (...args: unknown[]) => unknown;
}

/**
 * Tiny helper to keep track of interaction metadata keyed by string.
 * The returned `interactionRelationship` is a Map and can be manipulated directly
 * in tests or by consumers of this helper.
 */
export function useInteraction() {
    const interactionRelationship: Map<string, InteractionMeta> = new Map();

    function addInteractionMeta(key: string, meta: InteractionMeta) {
        interactionRelationship.set(key, meta);
    }

    function getInteractionMeta(key: string): InteractionMeta | undefined {
        return interactionRelationship.get(key);
    }

    function removeInteractionMeta(key: string) {
        interactionRelationship.delete(key);
    }

    return {
        interactionRelationship,
        addInteractionMeta,
        getInteractionMeta,
        removeInteractionMeta,
    }
}