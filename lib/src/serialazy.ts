import 'reflect-metadata';

import jsonSerializationBackend from './json/json_serialization_backend';
import TypeSerializer from './type_serializer';
import Constructor from './types/constructor';
import { JsonType } from './types/json_type';

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
            throw new Error(`Value is not serializable: ${serializable}`);
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
        throw new Error(`Type is not serializable: ${ctor.name}`);
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

// Types
// import * as Json from './types/json_type';
// export { Json };
