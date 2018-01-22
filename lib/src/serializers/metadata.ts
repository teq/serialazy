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
        public readonly classConstructor = proto.constructor as Constructable<any>,
        public readonly className = classConstructor.name
    ) {} // constructable via `getOrCreateFor`

    /** Contains serializable's own metadata */
    public ownSerializers = new Map<string, PropertySerializer>();

    /** Aggregates all serializers: own and inherited */
    public aggregateSerializers(): ReadonlyMap<string, PropertySerializer> {
        const parentMeta = this.seekForParentMeta();
        if (parentMeta) {
            return new Map([...parentMeta.aggregateSerializers(), ...this.ownSerializers]);
        } else {
            return new Map(this.ownSerializers); // clone
        }
    }

    /** Seek prototype chain for inherited serializable's metadata */
    private seekForParentMeta(): Metadata {
        let result: Metadata = null;
        let proto = this.proto;
        while (proto && !result) {
            proto = Object.getPrototypeOf(proto);
            result = proto ? Metadata.getFor(proto) : null;
        }
        return result;
    }

    /** Get metadata for given prototype if it's exists or create an empty metadata container */
    public static getOrCreateFor(proto: Object): Metadata {

        let metadata = this.getFor(proto);

        if (!metadata) {
            metadata = new Metadata(proto);
            Reflect.defineMetadata(METADATA_KEY, metadata, proto);
        }

        return metadata;

    }

    /** Get metadata for given prototype if it's exists or return a null */
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

    /** Get metadata for given prototype if it's exists or throw an error */
    public static expectFor(proto: Object): Metadata {

        let metadata = this.getFor(proto);

        if (!metadata) {
            throw new Error(
                `Provided type doesn\'t seem to be serializable: "${proto.constructor.name}". ` +
                'Hint: use "Serialize" decorator to mark properties for serialization'
            );
        }

        return metadata;

    }

}
