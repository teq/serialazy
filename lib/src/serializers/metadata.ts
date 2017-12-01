import PropertySerializer from './property_serializer';

const METADATA_KEY = Symbol('Metadata containing info about serializable object');

/** Metadata container for serializables */
export default class Metadata {

    private constructor(
        private target: Object,
        public className = target.constructor ? target.constructor.name : '<unknown>'
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
        let target = this.target;
        while (target && !result) {
            target = Object.getPrototypeOf(target);
            result = target ? Metadata.getFor(target) : null;
        }
        return result;
    }

    /** Get metadata for given object if it's exists or create an empty metadata container */
    public static getOrCreateFor(target: Object): Metadata {

        let metadata = this.getFor(target);

        if (!metadata) {
            metadata = new Metadata(target);
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
