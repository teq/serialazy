import ObjectPropertySerializer from './object_property_serializer';
import Constructor from "./types/constructor";
import TypeSerializer from "./type_serializer";

export interface ProjectionOptions {

    /**
     * Projection name
     * @defaultValue `"default"`
     */
    projection?: string;

    /**
     * If type or property is not serializable in given projection it tries to serialize/deserialize it in default projection
     * @defaultValue `true`
     */
    fallbackToDefaultProjection?: boolean;

}

export type DecoratorOptions<TSerialized, TOriginal> =
    TypeSerializer<TSerialized, TOriginal> &
    ObjectPropertySerializer.Options &
    Pick<ProjectionOptions, 'projection'>;

export interface DeflateOptions<TSerialized, TOriginal> extends ProjectionOptions {

    /** Overrides the type of serializable */
    as?: Constructor<TOriginal>;

}

export interface InflateOptions<TSerialized, TOriginal> extends ProjectionOptions {}
