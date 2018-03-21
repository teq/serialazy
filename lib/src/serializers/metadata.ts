import Constructable from '../types/constructable';
import PropertySerializer from './property_serializer';

/**
 * There may be multiple "serialazy" instances in project (from different dependencies)
 * We use global symbol to make sure that all of them can access the same metadata.
 */
const METADATA_KEY = Symbol.for('com.github.teq.serialazy.metadata');

/**
 * We need to make sure that metadata is compatible with all "serialazy" instances.
 * This version is increased in case of incompatible changes in `Metadata` class.
 */
const METADATA_VERSION = 1;

/** Metadata container for serializables */
export default class Metadata {

    private version = METADATA_VERSION;

    private constructor(
        private proto: Object,
        public readonly ctor = proto.constructor as Constructable.Default<any>,
        public readonly name = ctor.name
    ) {} // constructable via `getOrCreateFor`

    /** Contains serializable's own metadata */
    public ownSerializers = new Map<string, PropertySerializer<any, any>>();

    /** Aggregates all serializers: own and inherited */
    public aggregateSerializers(): ReadonlyMap<string, PropertySerializer<any, any>> {

        const parentMeta = Metadata.seekForInheritedMetaFor(this.proto);

        if (parentMeta) {
            return new Map([...parentMeta.aggregateSerializers(), ...this.ownSerializers]);
        } else {
            return new Map(this.ownSerializers); // clone
        }

    }

    /** Get own metadata for given prototype if it's exists or create an empty metadata container */
    public static getOrCreateFor(proto: Object): Metadata {

        let metadata = this.getFor(proto);

        if (!metadata) {
            metadata = new Metadata(proto);
            Reflect.defineMetadata(METADATA_KEY, metadata, proto);
        }

        return metadata;

    }

    /** Get own metadata for given prototype if it's exists or return a null */
    public static getFor(proto: Object): Metadata {

        if (proto === null || proto === undefined) {
            throw new Error('Expecting prototype object to be not null/undefined');
        }

        const metadata: Metadata = Reflect.getOwnMetadata(METADATA_KEY, proto) || null;

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

    /** Seek prototype chain for next inherited serializable's metadata */
    public static seekForInheritedMetaFor(proto: Object): Metadata {

        let result: Metadata = null;

        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? Metadata.getFor(proto) : null;
        }

        return result;

    }

    /** Get own metadata or seek prototype chain for nearest ancestor which has metadata. */
    public static getOwnOrInheritedMetaFor(proto: Object): Metadata {
        return Metadata.getFor(proto) || Metadata.seekForInheritedMetaFor(proto);
    }

}
