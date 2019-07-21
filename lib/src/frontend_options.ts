import ObjectPropertySerializer from './object_property_serializer';
import TypeSerializer from "./type_serializer";
import Constructor from "./types/constructor";

interface CommonOptions {
    /** _(optional)_ Use given projection. Default value: "default" */
    projection?: string;
}

export type SerializeDecoratorOptions<TSerialized, TOriginal> =
    TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options & CommonOptions;

export interface DeflateOptions<TSerialized, TOriginal> extends CommonOptions {
    /** _(optional)_ Serializable type constructor function. If provided, it overrides the type of serializable. */
    as?: Constructor<TOriginal>;
}

export interface InflateOptions<TSerialized, TOriginal> extends CommonOptions {}
