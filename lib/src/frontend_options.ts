import ObjectPropertySerializer from './object_property_serializer';
import TypeSerializer from "./type_serializer";
import Constructor from "./types/constructor";

export type SerializeDecoratorOptions<TSerialized, TOriginal> =
    TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options;

export interface DeflateOptions<TSerialized, TOriginal> {
    /** _(optional)_ Serializable type constructor function. If provided, it overrides the type of serializable. */
    as?: Constructor<TOriginal>;
}

export interface InflateOptions<TSerialized, TOriginal> {
}
