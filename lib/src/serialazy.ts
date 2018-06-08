import 'reflect-metadata';

import JsonTypeSerializer from './serializers/json/json_type_serializer';
import Constructor from './types/constructor';
import { JsonType } from './types/json_type';

/**
 * Deflate a serializable type to a JSON-compatible type
 * @param serializable Serializable type
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
export function deflate(serializable: any): JsonType {

    let serialized: JsonType;

    if (serializable === null || serializable === undefined) {
        serialized = serializable;
    } else {
        const { down } = JsonTypeSerializer.pickForValue(serializable);
        if (!down) {
            throw new Error(`Value is not serializable: ${serializable}`);
        }
        serialized = down(serializable);
    }

    return serialized;

}

/**
 * Construct/inflate a serializable type from JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Serializable instance
 */
export function inflate<T>(ctor: Constructor<T>, serialized: JsonType): T {

    if (typeof(ctor) !== 'function') {
        throw new Error('Expecting a constructor function');
    }

    const { up } = JsonTypeSerializer.pickForType(ctor);

    if (!up) {
        throw new Error(`Type is not serializable: ${ctor.name}`);
    }

    return up(serialized);

}

// Export decorators
export { default as Serializable } from './decorators/serializable';

// Export types
import * as Json from './types/json_type';
export { Json };
