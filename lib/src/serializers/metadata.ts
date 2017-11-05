import JsonType from '../types/json_type';
import Serializer from './serializer';

const METADATA_KEY = Symbol('Metadata containing info about serializable object');

/** Metadata container for serializables */
export default class Metadata {

    private constructor() {} // constructable via `getOrCreateFor`

    public props = new Map<string, Serializer<JsonType, any>>();

    /** Get metadata for given object if it's exists or create an empty metadata container */
    public static getOrCreateFor(target: Object): Metadata {

        let metadata = this.getFor(target);

        if (!metadata) {
            metadata = new Metadata();
            Reflect.defineMetadata(METADATA_KEY, metadata, target);
        }

        return metadata;

    }

    /** Get metadata for given object if it's exists or return a null */
    public static getFor(target: Object): Metadata {

        if (target === null || target === undefined) {
            throw new Error('null/undefined can not be serializable');
        }

        const metadata: Metadata = Reflect.getOwnMetadata(METADATA_KEY, target) || null;

        return metadata;

    }

    /** Get metadata for given object if it's exists or throw an error */
    public static expectFor(target: Object): Metadata {

        let metadata = this.getFor(target);

        if (!metadata) {
            throw new Error(
                'Provided type doesn\'t seem to be serializable. Hint: use "Serialize" decorator to mark properties for serialization'
            );
        }

        return metadata;

    }

}
