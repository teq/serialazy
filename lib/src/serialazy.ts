import 'reflect-metadata';

import Metadata from './serializers/metadata';
import Constructable from './types/constructable';
import { JsonMap } from './types/json_type';

/**
 * Deflate a serializable class instance to a JSON-compatible type
 * @param serializable Serializable class instance
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
export function deflate(serializable: any): JsonMap {

    let serialized: JsonMap;

    if (serializable === null || serializable === undefined) {

        serialized = serializable;

    } else {

        assertSerializable(serializable);
        const meta = Metadata.getOwnOrInheritedMetaFor(Object.getPrototypeOf(serializable));

        serialized = {};

        try {
            meta.aggregateSerializers().forEach(serializer => serializer.down(serializable, serialized));
        } catch (error) {
            throw new Error(`Unable to serialize an instance of a class "${meta.name}": ${error.message}`);
        }

    }

    return serialized;
}

/**
 * Construct/inflate class instance from JSON-compatible object
 * @param ctor Serializable class constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Serializable class instance
 */
export function inflate<T>(ctor: Constructable<T>, serialized: JsonMap): T {

    let classInstance: T;

    if (serialized === null || serialized === undefined) {

        classInstance = serialized as any;

    } else {

        if (!ctor || !ctor.prototype) {
            throw new Error('Expecting a valid constructor function');
        }

        assertSerializable(ctor);
        const meta = Metadata.getOwnOrInheritedMetaFor(ctor.prototype);

        classInstance = new ctor();

        try {
            meta.aggregateSerializers().forEach(serializer => serializer.up(classInstance, serialized));
        } catch (error) {
            throw new Error(`Unable to deserialize an instance of a class "${meta.name}": ${error.message}`);
        }

    }

    return classInstance;
}

/**
 * Check if target is a serializable class constructor or an instance of serializable class
 * @param target Target to check
 */
export function isSerializable(target: any): boolean {

    if (target === null || target === undefined) {
        throw new Error('Expecting `target` to be not null/undefined');
    }

    const meta = (typeof(target) === 'function' && target.prototype) ?
        Metadata.getOwnOrInheritedMetaFor(target.prototype) // treat target as a constructor function
        : Metadata.getOwnOrInheritedMetaFor(Object.getPrototypeOf(target)); // treat target as an instance

    return !!meta; // target is serializable if it has own or inherited metadata

}

/**
 * Asserts that target is a serializable class constructor or an instance of serializable class
 * @param target Target to check
 */
export function assertSerializable(target: any): void {

    if (!isSerializable(target)) {
        throw new Error(
            `Provided instance or constructor function doesn\'t seem to be serializable: "${target}". ` +
            'Hint: use "Serialize" decorator to mark properties for serialization'
        );
    }

}

/**
 * Traverse recursively all serializable properties of `destination`, merge them
 * with corresponding properties of `source` and return resulting object.
 * NOTE: This function mutates `destination`
 * @param destination Destination serializable class instance
 * @param source Source class instance or plain object (may be non-serializable) to take property values from
 * @returns Destination class instance
 */
export function deepMerge<T>(destination: T, source: T): T {

    if (destination === null || destination === undefined) {
        throw new Error('Expecting `destination` to be not null/undefined');
    }

    assertSerializable(destination);
    const meta = Metadata.getOwnOrInheritedMetaFor(Object.getPrototypeOf(destination));

    if (source !== null && source !== undefined) {
        try {
            meta.aggregateSerializers().forEach(serializer => serializer.assign(destination, source));
        } catch (error) {
            throw new Error(`Unable to perform a deep property merge for instance of "${meta.name}": ${error.message}`);
        }
    }

    return destination;

}

// Export decorators
export { default as Serialize} from './decorators/serialize';

// Export types
import * as Json from './types/json_type';
export { Json };
