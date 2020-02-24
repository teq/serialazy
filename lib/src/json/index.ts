import DecoratorFactory from '../decorator_factory';
import FrontendFunctions from '../frontend_functions';
import { DEFAULT_PROJECTION, MetadataManager } from '../metadata';
import { DecoratorOptions, DeflateOptions, InflateOptions } from '../options';
import Constructor from "../types/constructor";
import Util from '../types/util';
import JsonType from "./json_type";

export const BACKEND_NAME = 'json';

/**
 * Define serializer for given property or type
 * @param options Custom type serializer and/or other options
 * @returns Type/property decorator
 */
export function Serialize<TSerialized extends JsonType, TOriginal>(
    options?: DecoratorOptions<TSerialized, TOriginal>
): (protoOrCtor: Object | Constructor<TOriginal>, propertyName?: string) => void {
    return DecoratorFactory<JsonType, TOriginal>(BACKEND_NAME, options);
}

/**
 * Serialize given serializable type instance to a JSON-compatible type
 * @param serializable Serializable type instance
 * @param options Deflate options
 * @returns JSON-compatible type which can be safely passed to `JSON.serialize`
 */
export function deflate<TOriginal>(
    serializable: TOriginal,
    options?: DeflateOptions<JsonType, TOriginal>
): JsonType {
    return FrontendFunctions(BACKEND_NAME).deflate<JsonType, TOriginal>(serializable, options);
}

/**
 * Construct/deserialize a serializable type instance from a JSON-compatible object
 * @param ctor Serializable type constructor function
 * @param serialized JSON-compatible object (e.g. returned from `JSON.parse`)
 * @param options Inflate options
 * @returns Serializable type instance
 */
export function inflate<TOriginal>(
    ctor: Constructor<TOriginal>,
    serialized: JsonType,
    options?: InflateOptions<JsonType, TOriginal>
): TOriginal {
    return FrontendFunctions(BACKEND_NAME).inflate<JsonType, TOriginal>(ctor, serialized, options);
}

// Types
export * from './json_type';

// Define serializers for built-in types in default projection

const metaManager = MetadataManager.get(BACKEND_NAME, DEFAULT_PROJECTION);

if (!metaManager.getMetaFor(Boolean.prototype)) {
    Serialize({
        down: (original: any) => Util.expectBooleanOrNil(original),
        up: (serialized: any) => Util.expectBooleanOrNil(serialized)
    })(Boolean);
}

if (!metaManager.getMetaFor(Number.prototype)) {
    Serialize({
        down: (original: any) => Util.expectNumberOrNil(original),
        up: (serialized: any) => Util.expectNumberOrNil(serialized)
    })(Number);
}

if (!metaManager.getMetaFor(String.prototype)) {
    Serialize({
        down: (original: any) => Util.expectStringOrNil(original),
        up: (serialized: any) => Util.expectStringOrNil(serialized)
    })(String);
}
