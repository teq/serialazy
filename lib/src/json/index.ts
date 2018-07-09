import Constructor from "../types/constructor";
import JsonType from "./json_type";
import JsonTypeSerializer from "./json_type_serializer";

/**
 * Serialize given serializable type instance to a JSON-compatible type
 * @param serializable Serializable type instance
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
function serializeToJson(serializable: any): JsonType {

    let serialized: JsonType;

    if (serializable === null || serializable === undefined) {
        serialized = serializable;
    } else {
        const { down } = JsonTypeSerializer.pickForValue(serializable);
        if (!down) {
            throw new Error(`Unable to serialize a value: ${serializable}`);
        }
        serialized = down(serializable);
    }

    return serialized;

}

/**
 * Construct/deserialize a serializable type instance from a JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Serializable type instance
 */
function deserializeFromJson<T>(ctor: Constructor<T>, serialized: JsonType): T {

    if (typeof(ctor) !== 'function') {
        throw new Error('Expecting a constructor function');
    }

    const { up } = JsonTypeSerializer.pickForType(ctor);

    if (!up) {
        throw new Error(`Unable to deserialize an instance of "${ctor.name}" from: ${serialized}`);
    }

    return up(serialized);

}

// Functions
export {
    serializeToJson,
    serializeToJson as serialize, // alias
    deserializeFromJson,
    deserializeFromJson as deserialize // alias
};

// Decorators
export {
    default as JsonSerializable,
    default as Serializable // alias
} from './json_serializable';
