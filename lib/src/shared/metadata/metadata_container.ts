import { DEFAULT_PROJECTION } from '.';
import { DeflateOrInflateOptions, InflateOptions } from '../options';
import PropertySerializer from '../property_serializer';
import { Constructor, Provider, isPromise } from '../util';
import TypeSerializer from '../type_serializer';
import MetadataManager from './metadata_manager';

/** Metadata container for serializables */
export default class MetadataContainer {

    /**
     * Metadata version number.
     *
     * It is possible to mix multiple serialazy versions which came from different dependencies.
     * To make sure that we access a compatible version of metadata (or throw an error instead)
     * we use a metadata version number.
     *
     * It's not directly linked with package (NPM) version, but:
     * * Several consecutive major package versions can share the same metadata version.
     *   (If there are chages in public API, but not in metadata format)
     * * Metadata version increase is a **breaking change**, so the major part
     *   of package versions should be increased as well
     */
    public static VERSION = 3;

    /** Metadata instance version number */
    public readonly version = MetadataContainer.VERSION;

    /** Type constructor */
    public readonly ctor: Constructor<any>;

    /** Type name */
    public readonly name: string;

    private typeSerializerProvider: Provider<TypeSerializer<any, any>>;
    private propertySerializers = new Map<string, PropertySerializer<any, any, unknown>>();

    public constructor(
        public readonly backend: string,
        public readonly projection: string,
        public readonly proto: Object,
    ) {
        this.ctor = proto.constructor as Constructor<any>;
        this.name = this.ctor.name;
    }

    public setOwnTypeSerializer(
        typeSerializer: TypeSerializer<any, any> | Provider<TypeSerializer<any, any>>
    ) {

        if (this.typeSerializerProvider) {
            throw new Error(`Unable to re-define custom type serializer for "${this.name}"`);
        }

        this.typeSerializerProvider = typeof(typeSerializer) === 'function' ? typeSerializer : () => typeSerializer;

    }

    public getOwnTypeSerializer() {
        return this.typeSerializerProvider?.();
    }

    public addOwnPropertySerializer(propSerializer: PropertySerializer<any, any, unknown>) {

        if (this.propertySerializers.has(propSerializer.propertyName)) {
            throw new Error(`Unable to redefine serializer for "${propSerializer.propertyName}" property of "${this.name}"`);
        }

        const conflict = Array.from(this.propertySerializers.values()).find(ps => ps.propertyTag === propSerializer.propertyTag);
        if (conflict) {
            throw new Error(
                `Unable to define serializer for "${propSerializer.propertyName}" property of "${this.name}": ` +
                `"${conflict.propertyTag}" tag already used by "${conflict.propertyName}" property`
            );
        }

        this.propertySerializers.set(propSerializer.propertyName, propSerializer);

    }

    public getOwnPropertySerializers() {
        return this.propertySerializers as ReadonlyMap<string, PropertySerializer<any, any, unknown>>;
    }

    /** Check if it has own or inherited property serializers */
    public hasPropertySerializers() {
        return !!this.aggregatePropertySerializers({ fallbackToDefaultProjection: true });
    }

    /**
     * Get own type serializer or build type serializer
     * based on own and inherited property serializers
     */
    public getTypeSerializer(options?: DeflateOrInflateOptions<any, any>): TypeSerializer<any, any> {

        let { prioritizePropSerializers = false } = options || {};

        const typeSerializer = prioritizePropSerializers ?
            (this.buildPropertyBagSerializer(options) ?? this.getOwnTypeSerializer())
            : (this.getOwnTypeSerializer() ?? this.buildPropertyBagSerializer(options));

        return typeSerializer ?? { type: this.ctor };

    }

    /** Build type serializer based on own and inherited property serializers */
    private buildPropertyBagSerializer(options?: DeflateOrInflateOptions<any, any>): TypeSerializer<any, any> {

        const serializers = this.aggregatePropertySerializers(options);
        const { toPojo = false } = options as InflateOptions<any, any> || {};

        if (serializers.size > 0) {

            return {

                type: this.ctor,

                down: (serializable: any) => {

                    if (serializable === null || serializable === undefined) {
                        return serializable;
                    }

                    const serialized = {};

                    try {
                        const results = Array.from(serializers.values()).map(serializer => serializer.down(serializable, serialized, options));
                        if (results.some(result => isPromise(result))) {
                            return (() => Promise.all(results).then(() => serialized))();
                        } else {
                            return serialized;
                        }
                    } catch (error) {
                        throw new Error(`Unable to serialize an instance of "${this.name}" in projection: "${this.projection}": ${error.message}`);
                    }

                },

                up: (serialized: any) => {

                    if (serialized === null || serialized === undefined) {
                        return serialized;
                    }

                    const serializable: any = toPojo ? {} : new this.ctor();

                    try {
                        const results = Array.from(serializers.values()).map(serializer => serializer.up(serializable, serialized, options));
                        if (results.some(result => isPromise(result))) {
                            return (() => Promise.all(results).then(() => serializable))();
                        } else {
                            return serializable;
                        }
                    } catch (error) {
                        throw new Error(`Unable to deserialize an instance of "${this.name}" in projection: "${this.projection}": ${error.message}`);
                    }

                }

            };

        }

    }

    /** Aggregate all property serializers: own and inherited */
    private aggregatePropertySerializers(options?: DeflateOrInflateOptions<any, any>) {

        let { fallbackToDefaultProjection = true } = options || {};

        let serializers = new Map(this.propertySerializers); // clone

        const defaultMeta = MetadataManager.get(this.backend, DEFAULT_PROJECTION).getOwnMetaFor(this.proto);

        if (fallbackToDefaultProjection && defaultMeta) {
            serializers = new Map([
                ...defaultMeta.propertySerializers,
                ...serializers
            ]);
        }

        const inheritedMeta = MetadataManager.get(this.backend, this.projection).seekInheritedMetaFor(this.proto);

        if (inheritedMeta) {
            serializers = new Map([
                ...inheritedMeta.aggregatePropertySerializers(options),
                ...serializers
            ]);
        }

        return serializers as ReadonlyMap<string, PropertySerializer<any, any, unknown>>;

    }

}
