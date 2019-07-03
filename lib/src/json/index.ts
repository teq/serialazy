import DecoratorFactory from '../decorator_factory';
import ObjectPropertySerializer from '../object_property_serializer';
import TypeSerializer from "../type_serializer";
import TypeSerializerPicker from '../type_serializer_picker';
import Constructor from "../types/constructor";
import Util from '../types/util';
import JsonType from "./json_type";

const BACKEND = 'json';
const picker = new TypeSerializerPicker<JsonType>(BACKEND);
const decoratorFactory = new DecoratorFactory<JsonType>(BACKEND);

/**
 * Define serializer for given property or type
 * @param params _(optional)_ Custom type serializer and/or options
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
    return picker.deflate(serializable, ctor);
}

/**
 * Construct/deserialize a serializable type instance from a JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @returns Serializable type instance
 */
export function inflate<TOriginal>(ctor: Constructor<TOriginal>, serialized: JsonType): TOriginal {
    return picker.inflate(ctor, serialized);
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
