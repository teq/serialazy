import Constructable from '../types/constructable';
import Provider from '../types/provider';
import PropertySerializer from './property_serializer';
import TypeSerializer from './type_serializer';

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

    private propSerializers = new Map<string, PropertySerializer<any, any>>();

    private typeSerializerProvider: Provider<TypeSerializer<any, any>> = null;

    private constructor(
        private proto: Object,
        public readonly ctor = proto.constructor as Constructable.Default<any>,
        public readonly name = ctor.name
    ) {} // constructable via `getOrCreateFor`

    public getTypeSerializer() {
        if (this.typeSerializerProvider) {
            return this.typeSerializerProvider();
        } else {
            return {
                type: this.ctor,
                down: (serializable: any) => {
                    const serialized = {};
                    try {
                        this.aggregateSerializers().forEach(serializer => serializer.down(serializable, serialized));
                    } catch (error) {
                        throw new Error(`Unable to serialize an instance of a class "${this.name}": ${error.message}`);
                    }
                    return serialized;
                },
                up: (serialized: any) => {
                    const serializable = new this.ctor();
                    try {
                        this.aggregateSerializers().forEach(serializer => serializer.up(serializable, serialized));
                    } catch (error) {
                        throw new Error(`Unable to deserialize an instance of a class "${this.name}": ${error.message}`);
                    }
                    return serializable;
                }
            };
        }

    }

    public setTypeSerializer(typeSerializerProvider: Provider<TypeSerializer<any, any>>) {
        if (this.typeSerializerProvider) {
            throw new Error('Unable to redefine custom serializer');
        }
        if (this.propSerializers.size > 0) {
            throw new Error();
        }
        if (Metadata.seekForInheritedMetaFor(this.proto)) {
            throw new Error();
        }
        this.typeSerializerProvider = typeSerializerProvider;
    }

    public setPropertySerializer(propName: string, propSerializer: PropertySerializer<any, any>) {
        if (this.typeSerializerProvider) {
            throw new Error();
        }
        this.propSerializers.set(propName, propSerializer);
    }

    /** Aggregates all serializers: own and inherited */
    private aggregateSerializers(): Map<string, PropertySerializer<any, any>> {

        const inheritedMeta = Metadata.seekForInheritedMetaFor(this.proto);

        if (inheritedMeta) {
            return new Map([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Map(this.propSerializers); // clone
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
