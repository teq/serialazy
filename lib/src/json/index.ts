import DecoratorFactory from '../decorator_factory';
import ObjectPropertySerializer from '../object_property_serializer';
import TypeSerializer from "../type_serializer";
import Constructor from "../types/constructor";
import Util from '../types/util';
import JsonType from "./json_type";

const picker = new TypeSerializer.Picker<JsonType>('json');
const decoratorFactory = new DecoratorFactory<JsonType>('json');

/**
 * Define serializer for given property or type
 * @param params _(optional)_ Type serializer and/or options
 * @returns Type/property decorator
 */
export function Serialize<TSerialized extends JsonType, TOriginal>(
    params?: TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options
) {
    return decoratorFactory.create(params);
}

/**
 * Serialize given serializable type instance to a JSON-compatible type
 * @param serializable Serializable type instance
 * @param ctor _(optional)_ Serializable type constructor function. If provided, it overrides the type of serializable.
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
export function deflate<TOriginal>(serializable: TOriginal, ctor?: Constructor<TOriginal>): JsonType {

    let serialized: JsonType;

    if (serializable === null || serializable === undefined) {
        serialized = serializable as null | undefined;
    } else {
        const { down } = typeof(ctor) === 'function' ? picker.pickForType(ctor) : picker.pickForValue(serializable);
        if (!down) {
            throw new Error(`Unable to serialize a value: ${serializable}`);
        }
        serialized = down(serializable);
    }

    return serialized;

}

/**
 * Construct/deserialize a serializable type instance from a JSON-compatible object
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @param ctor Serializable type constructor function
 * @returns Serializable type instance
 */
export function inflate<TOriginal>(serialized: JsonType, ctor: Constructor<TOriginal>): TOriginal {

    if (typeof(ctor) !== 'function') {
        throw new Error('Expecting a constructor function');
    }

    const { up } = picker.pickForType(ctor);

    if (!up) {
        throw new Error(`Unable to deserialize an instance of "${ctor.name}" from: ${serialized}`);
    }

    return up(serialized);

}

// Types
export * from './json_type';

// Define serializers for built-in types

Serialize({
    down: (original: any) => Util.expectBooleanOrNil(original),
    up: (serialized: any) => Util.expectBooleanOrNil(serialized)
})(Boolean);

Serialize({
    down: (original: any) => Util.expectNumberOrNil(original),
    up: (serialized: any) => Util.expectNumberOrNil(serialized)
})(Number);

Serialize({
    down: (original: any) => Util.expectStringOrNil(original),
    up: (serialized: any) => Util.expectStringOrNil(serialized)
})(String);
