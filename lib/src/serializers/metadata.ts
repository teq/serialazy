import Constructable from '../types/constructable';
import PropertySerializer from './property_serializer';

const METADATA_KEY = Symbol('Metadata containing info about serializable object');

/** Metadata container for serializables */
export default class Metadata {

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
