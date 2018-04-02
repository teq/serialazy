import 'reflect-metadata';

import Metadata from './serializers/metadata';
import Constructable from './types/constructable';
import { JsonMap } from './types/json_type';

/**
 * Deflate a serializable type to a JSON-compatible type
 * @param serializable Serializable type
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
function deflate(serializable: any): JsonMap {

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
 * Construct/inflate a serializable type from JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Serializable instance
 */
function inflate<T>(ctor: Constructable<T>, serialized: JsonMap): T {

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
 * Check if target is a serializable value or type
 * @param target Target to check
 */
function isSerializable(target: any): boolean {

    if (target === undefined) { // undefined is not a valid JSON value
        return false;
    } else if (target === null) {
        return true;
    } else if (typeof(target) === 'function' && target.prototype) { // treat target as a constructor function
        if (target === Boolean || target === Number || target === String) { // primitive
            return true;
        } else { // non-primitive type
            return !!Metadata.getOwnOrInheritedMetaFor(target.prototype);
        }
    } else { // treat target as a value
        if (
            typeof(target) === 'boolean' || target instanceof Boolean ||
            typeof(target) === 'number' || target instanceof Number ||
            typeof(target) === 'string' || target instanceof String
        ) { // primitive
            return true;
        } else { // non-primitive type
            return !!Metadata.getOwnOrInheritedMetaFor(Object.getPrototypeOf(target));
        }
    }

}

/**
 * Asserts that target is a serializable value or type
 * @param target Target to check
 */
function assertSerializable(target: any): void {

    if (!isSerializable(target)) {
        throw new Error(
            `Provided instance or constructor function doesn\'t seem to be serializable: "${target}". ` +
            'Hint: use "Serialize" decorator to mark properties for serialization'
        );
    }

}

export { inflate, deflate, isSerializable };

// Export decorators
export { default as Serialize} from './decorators/serialize';

// Export types
import * as Json from './types/json_type';
export { Json };
