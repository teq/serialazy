import Constructor from '../../types/constructor';
import TypeSerializer from '../type_serializer';

/**
 * There may be multiple "serialazy" instances in project (from different dependencies)
 * We use global symbol to make sure that all of them can access the same metadata.
 */
const METADATA_KEY = Symbol.for('com.github.teq.serialazy.metadata');

/**
 * We need to make sure that metadata is compatible with all "serialazy" instances.
 * This version is increased in case of incompatible changes in `Metadata` class.
 */
const METADATA_VERSION = 2;

/** Abstract metadata container for serializables */
abstract class SerializableTypeMetadata {

    /** Serializable type */
    public abstract readonly type: SerializableTypeMetadata.Type;

    /** Type constructor */
    public readonly ctor: Constructor.Default<any>;

    /** Type name */
    public readonly name: string;

    private version = METADATA_VERSION;

    protected constructor(
        protected proto: Object
    ) { // constructable via `getOrCreateFor`
        this.ctor = proto.constructor as Constructor.Default<any>;
        this.name = this.ctor.name;
    }

    /** Get type serializer based on metadata */
    public abstract getTypeSerializer(): TypeSerializer<any, any>;

    /** Get own metadata for given prototype if it's exists or return a null */
    public static getFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const metadata: TMetadata = Reflect.getOwnMetadata(METADATA_KEY, proto) || null;

        if (metadata) {
            const version = metadata.version || 0;
            if (version !== METADATA_VERSION) {
                throw new Error(
                    `Metadata version mismatch (lib: ${METADATA_VERSION}, meta: ${version}). ` +
                    'Seems like you\'re trying to use 2 or more incompatible versions of "serialazy"'
                );
            }
        }

        return metadata;

    }

    protected static setFor(proto: Object, metadata: SerializableTypeMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, proto);
    }

    /** Seek prototype chain for next inherited serializable's metadata */
    protected static seekForInheritedMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {

        let result: TMetadata = null;

        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? this.getFor<TMetadata>(proto) : null;
        }

        return result;

    }

    /** Get own metadata or seek prototype chain for nearest ancestor which has metadata. */
    public static getOwnOrInheritedMetaFor<TMetadata extends SerializableTypeMetadata>(proto: Object): TMetadata {
        return this.getFor<TMetadata>(proto) || this.seekForInheritedMetaFor<TMetadata>(proto);
    }

}

namespace SerializableTypeMetadata {

    /** Metadata type */
    export enum Type {
        /** Metadata for a custom serializable type */
        CUSTOM = 'custom',
        /** Metadata for a property bag */
        PROP_BAG = 'bag'
    }

}

export default SerializableTypeMetadata;
