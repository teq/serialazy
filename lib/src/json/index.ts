import DecoratorFactory from '../decorator_factory';
import { DeflateOptions, InflateOptions, SerializeDecoratorOptions } from '../frontend_options';
import TypeSerializerPicker from '../type_serializer_picker';
import Constructor from "../types/constructor";
import Util from '../types/util';
import JsonType from "./json_type";

const BACKEND = 'json';
const picker = new TypeSerializerPicker<JsonType>(BACKEND);
const decoratorFactory = new DecoratorFactory<JsonType>(BACKEND);

/**
 * Define serializer for given property or type
 * @param options _(optional)_ Custom type serializer and/or other options
 * @returns Type/property decorator
 */
export function Serialize<TSerialized extends JsonType, TOriginal>(
    options?: SerializeDecoratorOptions<TSerialized, TOriginal>
): (protoOrCtor: Object | Constructor<TOriginal>, propertyName?: string) => void {
    return decoratorFactory.create(options);
}

/**
 * Serialize given serializable type instance to a JSON-compatible type
 * @param serializable Serializable type instance
 * @param options _(optional)_ Deflate options
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
export function deflate<TOriginal>(
    serializable: TOriginal,
    options?: DeflateOptions<JsonType, TOriginal>
): JsonType {
    return picker.deflate(serializable, options);
}

/**
 * Construct/deserialize a serializable type instance from a JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @param options _(optional)_ Inflate options
 * @returns Serializable type instance
 */
export function inflate<TOriginal>(
    ctor: Constructor<TOriginal>,
    serialized: JsonType,
    options?: InflateOptions<JsonType, TOriginal>
): TOriginal {
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
