import { Operation, OperationSource, OperationType } from './orchestration/operations';
import { Serializer } from "./serialization";

export interface WidgetMeta {
  id: string;
  properties: Record<string, any>;
  events: Record<string, Function>;
  functionFields?: string[];
  jsonFields?: string[];
}

export interface SerializedWidgetMeta {
  id: string;
  properties: Record<string, any>;
  events: Record<string, string>;
  functionFields?: string[];
  jsonFields?: string[];
}

function setNestedProperty(obj: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function getNestedProperty(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

export class WidgetMetaStore {
  private metaMap: Map<string, WidgetMeta> = new Map();
  private static serializer: Serializer = new Serializer();

  constructor() {}

  private createOperation(type: OperationType, payload: any): Operation {
      return {
          source: OperationSource.WidgetMeta,
          type,
          timestamp: Date.now(),
          payload,
      };
  }

  public addMeta(meta: WidgetMeta, record: boolean = true): Operation[] {
    this.metaMap.set(meta.id, meta);
    if (record) {
        return [this.createOperation(OperationType.AddMeta, { meta })];
    }
    return [];
  }

  public getMeta(id: string): WidgetMeta | undefined {
    return this.metaMap.get(id);
  }

  public updateMeta(id: string, updates: Partial<WidgetMeta>, record: boolean = true): Operation[] {
    const oldMeta = this.metaMap.get(id);
    if (oldMeta) {
      const newMeta = { ...oldMeta, ...updates };
      this.metaMap.set(id, newMeta);

      if (record) {
          const inverseChanges = Object.keys(updates).reduce((acc, key) => {
              acc[key] = oldMeta[key];
              return acc;
          }, {});

          return [this.createOperation(OperationType.UpdateMeta, {
              id,
              updates,
              oldMeta: inverseChanges,
          })];
      }
    }
    return [];
  }

  public deleteMeta(id: string, record: boolean = true): Operation[] {
    const metaToDelete = this.metaMap.get(id);
    if (metaToDelete) {
      this.metaMap.delete(id);
      if (record) {
          return [this.createOperation(OperationType.DeleteMeta, { deletedMeta: { ...metaToDelete } })];
      }
    }
    return [];
  }

  public static serialize(meta: WidgetMeta): SerializedWidgetMeta {
    // ... (serialization logic remains the same)
    const serializedMeta: SerializedWidgetMeta = {
      id: meta.id,
      properties: { ...meta.properties },
      events: {},
      functionFields: meta.functionFields ? [...meta.functionFields] : undefined,
      jsonFields: meta.jsonFields ? [...meta.jsonFields] : undefined,
    };

    for (const eventName in meta.events) {
      if (Object.prototype.hasOwnProperty.call(meta.events, eventName)) {
        serializedMeta.events[eventName] = WidgetMetaStore.serializer.serialize(meta.events[eventName]);
      }
    }

    if (meta.functionFields) {
      for (const fieldPath of meta.functionFields) {
        const value = getNestedProperty(meta, fieldPath);
        if (typeof value === 'function') {
          setNestedProperty(serializedMeta, fieldPath, WidgetMetaStore.serializer.serialize(value));
        }
      }
    }

    if (meta.jsonFields) {
      for (const fieldPath of meta.jsonFields) {
        const value = getNestedProperty(meta, fieldPath);
        if (typeof value === 'object' && value !== null) {
          setNestedProperty(serializedMeta, fieldPath, JSON.stringify(value));
        }
      }
    }

    return serializedMeta;
  }

  public static deserialize(serializedMeta: SerializedWidgetMeta): WidgetMeta {
    // ... (deserialization logic remains the same)
    const deserializedMeta: WidgetMeta = {
      id: serializedMeta.id,
      properties: { ...serializedMeta.properties },
      events: {},
      functionFields: serializedMeta.functionFields ? [...serializedMeta.functionFields] : undefined,
      jsonFields: serializedMeta.jsonFields ? [...serializedMeta.jsonFields] : undefined,
    };

    for (const eventName in serializedMeta.events) {
      if (Object.prototype.hasOwnProperty.call(serializedMeta.events, eventName)) {
        deserializedMeta.events[eventName] = WidgetMetaStore.serializer.deserialize(serializedMeta.events[eventName], 'Function');
      }
    }

    if (serializedMeta.functionFields) {
      for (const fieldPath of serializedMeta.functionFields) {
        const value = getNestedProperty(serializedMeta, fieldPath);
        if (typeof value === 'string') {
          setNestedProperty(deserializedMeta, fieldPath, WidgetMetaStore.serializer.deserialize(value, 'Function'));
        }
      }
    }

    if (serializedMeta.jsonFields) {
      for (const fieldPath of serializedMeta.jsonFields) {
        const value = getNestedProperty(serializedMeta, fieldPath);
        if (typeof value === 'string') {
          setNestedProperty(deserializedMeta, fieldPath, WidgetMetaStore.serializer.deserialize(value));
        }
      }
    }

    return deserializedMeta;
  }
}
