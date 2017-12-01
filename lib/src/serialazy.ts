import 'reflect-metadata';

import Metadata from './serializers/metadata';
import Constructable from './types/constructable';
import { JsonMap } from './types/json_type';

/**
 * Deflate class instance to a JSON-compatible object
 * @param serializable Serializable object
 * @returns JSON-compatible object which can be safely passed to `JSON.serialize`
 */
export function deflate(serializable: any): JsonMap {

    let serialized: JsonMap;

    if (serializable === null || serializable === undefined) {

        serialized = serializable;

    } else {

        const proto = Object.getPrototypeOf(serializable) || {};

        serialized = {};

        const meta = Metadata.expectFor(proto);

        try {
            meta.aggregateSerializers().forEach(serializer => serializer.down(serializable, serialized));
        } catch (error) {
            throw new Error(`Unable to serialize an instance of a class "${meta.className}": ${error.message}`);
        }

    }

    return serialized;
}

/**
 * Construct/inflate class instance from JSON-compatible object
 * @param ctor Class instance constructor
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Class instance
 */
export function inflate<T>(ctor: Constructable<T>, serialized: JsonMap): T {

    let classInstance: T;

    if (serialized === null || serialized === undefined) {

        classInstance = serialized as any;

    } else {

        if (!ctor || !ctor.prototype) {
            throw new Error('Expecting a valid constructor function');
        }

        classInstance = new ctor();

        const meta = Metadata.expectFor(ctor.prototype);

        try {
            meta.aggregateSerializers().forEach(serializer => serializer.up(classInstance, serialized));
        } catch (error) {
            throw new Error(`Unable to deserialize an instance of a class "${meta.className}": ${error.message}`);
        }

    }

    return classInstance;
}

// Export decorators
export { default as Serialize} from './decorators/serialize';

// Export types
import * as Json from './types/json_type';
export { Json };
