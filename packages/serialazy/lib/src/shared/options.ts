import ObjectPropertySerializer from './object_property_serializer';
import TypeSerializer from "./type_serializer";
import { Constructor } from "./util";

export interface SerializationOptions {

    /**
     * Projection name
     * @defaultValue `"default"`
     */
    projection?: string;

    /**
     * If type or property is not serializable in given projection
     * it tries to serialize/deserialize it in default projection
     * @defaultValue `true`
     */
    fallbackToDefaultProjection?: boolean;

    /**
     * Controls which serializer takes precedence:
     * - One which comes from a type (class decorator). It is the **default** behavior.
     * - Or one which built upon property serializers (own and inherited).
     * @defaultValue `false`
     */
    prioritizePropSerializers?: boolean;

}

export type DecoratorOptions<TSerialized, TOriginal> =
    TypeSerializer<TSerialized, TOriginal> &
    ObjectPropertySerializer.Options &
    Pick<SerializationOptions, 'projection'>;

export interface DeflateOptions<TSerialized, TOriginal> extends SerializationOptions {

    /** Serialize instance as if it were of the given type */
    as?: Constructor<TOriginal>;

}

export interface InflateOptions<TSerialized, TOriginal> extends SerializationOptions {

    /**
     * Deserialize to plain javascript object (POJO)
     * @defaultValue `false`
     */
    toPojo?: boolean;

}

export type DeflateOrInflateOptions<TSerialized, TOriginal> =
    DeflateOptions<TSerialized, TOriginal> |
    InflateOptions<TSerialized, TOriginal>;
