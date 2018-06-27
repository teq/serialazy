import 'reflect-metadata';

import jsonSerializationBackend from './json/json_serialization_backend';
import JsonType from './json/json_type';
import TypeSerializer from './type_serializer';
import Constructor from './types/constructor';

const typeSerializerPicker = new TypeSerializer.Picker(jsonSerializationBackend);

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
        const { down } = typeSerializerPicker.pickForValue(serializable);
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

    const { up } = typeSerializerPicker.pickForType(ctor);

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
} from './json/json_serializable';

// Internals (for backend implementations)
export * from './metadata';
export { default as PropertySerializer } from './property_serializer';
export { default as SerializationBackend } from './serialization_backend';
export { default as TypeSerializer } from './type_serializer';
