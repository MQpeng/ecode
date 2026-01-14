export interface TypeHandler<T, S> {
  canHandle(value: any): boolean;
  serialize(value: T): S;
  deserialize(serializedValue: S, targetType?: string): T;
}

export class FunctionTypeHandler implements TypeHandler<Function, string> {
  canHandle(value: any): boolean {
    return typeof value === 'function';
  }

  serialize(value: Function): string {
    return value.toString();
  }

  deserialize(serializedValue: string): Function {
    try {
      // Using new Function() to recreate the function from its string representation.
      // This approach creates functions in the global scope. Care should be taken
      // regarding security if serializedValue comes from untrusted sources.
      return new Function(`return ${serializedValue}`)();
    } catch (error) {
      console.error(`Error deserializing function:`, error);
      return () => {}; // Assign a no-op function in case of deserialization error
    }
  }
}

// Handler for strings that represent JSON objects/arrays.
// This handler will parse the JSON string and then recursively deserialize its contents.
export class JsonStringTypeHandler implements TypeHandler<any, string> {
  private serializer: Serializer | null = null; // For recursive deserialization

  setSerializer(serializer: Serializer) {
    this.serializer = serializer;
  }

  canHandle(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    // Simple heuristic to check if it looks like a JSON string.
    // A more robust check might involve trying JSON.parse and catching errors,
    // but that could be inefficient if applied to every string.
    // For now, check if it starts with '{' or '[' and ends with '}' or ']'
    const trimmed = value.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  serialize(value: any): string {
    // This handler's primary role is deserialization of JSON strings.
    // If serialize is called, it means a value was passed that this handler 'canHandle' for serialization.
    // Given the `canHandle` for strings, this might not be hit often.
    // However, if an object is passed to serializer, and it's then delegated here, stringify it.
    return JSON.stringify(value);
  }

  deserialize(serializedValue: string): any {
    if (!this.serializer) {
      try {
        return JSON.parse(serializedValue);
      } catch (e) {
        console.error(`Error parsing JSON string without serializer:`, e);
        return serializedValue;
      }
    }
    try {
      const parsed = JSON.parse(serializedValue);
      // Recursively deserialize contents of the parsed object/array
      if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
          return parsed.map(item => this.serializer!.deserialize(item));
        } else {
          const deserializedObject: Record<string, any> = {};
          for (const key in parsed) {
            if (Object.prototype.hasOwnProperty.call(parsed, key)) {
              deserializedObject[key] = this.serializer!.deserialize(parsed[key]);
            }
          }
          return deserializedObject;
        }
      }
      return parsed; // Return primitives or null directly
    } catch (error) {
      console.error(`Error deserializing JSON string:`, error);
      return serializedValue; // Return original string if parsing/deserialization fails
    }
  }
}

export class Serializer {
  private handlers: TypeHandler<any, any>[] = [];
  private jsonStringTypeHandler: JsonStringTypeHandler;

  constructor() {
    this.jsonStringTypeHandler = new JsonStringTypeHandler();
    this.jsonStringTypeHandler.setSerializer(this); // Allow it to use this serializer recursively

    // Register default handlers. Custom handlers should be registered by the user.
    // Order matters: more specific handlers should come first if there's overlap.
    this.registerHandler(new FunctionTypeHandler());
    this.registerHandler(this.jsonStringTypeHandler); // Register the JSON string handler
  }

  public registerHandler(handler: TypeHandler<any, any>): void {
    // Add handlers to the beginning so custom handlers can override default ones
    this.handlers.unshift(handler);
  }

  public serialize<T>(value: T): any {
    for (const handler of this.handlers) {
      if (handler.canHandle(value)) {
        return handler.serialize(value);
      }
    }
    // Fallback for types not explicitly handled by custom handlers (e.g., primitives, plain objects)
    // For plain objects, JSON.stringify/parse can be implicitly used when the whole structure is serialized.
    return value;
  }

  public deserialize<T>(serializedValue: any, targetType?: string): T {
    // First, try to find a handler that explicitly matches targetType (if provided)
    if (targetType) {
      for (const handler of this.handlers) {
        // Specific check for Function by targetType
        if (targetType === 'Function' && handler instanceof FunctionTypeHandler) {
          return handler.deserialize(serializedValue) as T;
        }
        // Add other targetType-specific checks here if custom handlers need to be looked up by targetType
      }
    }

    // If no specific targetType match or targetType not provided,
    // iterate through handlers and let them decide based on canHandle
    for (const handler of this.handlers) {
      if (handler.canHandle(serializedValue)) {
        return handler.deserialize(serializedValue) as T;
      }
    }

    // Fallback for types not explicitly handled by custom handlers
    return serializedValue;
  }
}
