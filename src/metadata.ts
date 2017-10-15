import SerializationError from './errors/serialization_error';
import JsonType from './json_type';
import Serializer from './serializers/serializer';

const metadataKey = Symbol('Serializable object metadata');

/** Metadata container for serializables */
export default class Metadata {

    private constructor() {} // constructable via `getOrCreateFor`

    public props = new Map<string, Serializer<JsonType, any>>();

    /** Get metadata for given object if it's exists or create an empty metadata container */
    public static getOrCreateFor(target: Object): Metadata {

        if (target === null || target === undefined) {
            throw new SerializationError('Unable to get or create metadata for null/undefined object');
        }

        let metadata: Metadata = null;

        if (!Reflect.hasOwnMetadata(metadataKey, target)) {
            metadata = new Metadata();
            Reflect.defineMetadata(metadataKey, metadata, target);
        } else {
            metadata = Reflect.getOwnMetadata(metadataKey, target);
        }

        return metadata;

    }

    /** Get metadata for given object if it's exists or return a null */
    public static getFor(target: Object): Metadata {

        if (target === null || target === undefined) {
            throw new SerializationError('Unable to get metadata for null/undefined object');
        }

        const metadata: Metadata = Reflect.getOwnMetadata(metadataKey, target) || null;

        return metadata;

    }

}
