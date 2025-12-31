export interface InteractionMeta {
    label: string;
    eventName: string;
    trigger: Function;
}

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
        interactionRelationship
    }
}