import { DEFAULT_PROJECTION } from '.';
import PropertySerializer from '../property_serializer';
import TypeSerializer from '../type_serializer';
import GenericMetadata from './generic_metadata';
import MetadataManager from './metadata_manager';

/** Metadata container for serializable property bag */
export default class PropertyBagMetadata extends GenericMetadata {

    public static readonly kind = Symbol.for('com.github.teq.serialazy.propertyBagMetadata');

    public readonly kind: typeof PropertyBagMetadata.kind = PropertyBagMetadata.kind;

    public readonly propertySerializers = new Map<string, PropertySerializer<any, any, unknown>>();

    public getTypeSerializer(fallbackToDefaultProjection: boolean): TypeSerializer<any, any> {

        const serializers = this.aggregateSerializers(fallbackToDefaultProjection);
        const options = { projection: this.projection, fallbackToDefaultProjection };

        return {

            type: this.ctor,

            down: (serializable: any) => {

                let serialized: {};

                if (serializable === null || serializable === undefined) {
                    serialized = serializable;
                } else {
                    serialized = {};
                    try {
                        serializers.forEach(serializer => serializer.down(serializable, serialized, options));
                    } catch (error) {
                        throw new Error(`Unable to serialize an instance of "${this.name}" in projection: "${this.projection}": ${error.message}`);
                    }
                }

                return serialized;

            },

            up: (serialized: any) => {

                let serializable: any;

                if (serialized === null || serialized === undefined) {
                    serializable = serialized;
                } else {
                    serializable = new this.ctor();
                    try {
                        serializers.forEach(serializer => serializer.up(serializable, serialized, options));
                    } catch (error) {
                        throw new Error(`Unable to deserialize an instance of "${this.name}" in projection: "${this.projection}": ${error.message}`);
                    }
                }

                return serializable;

            }

        };

    }

    public addPropertySerializer(propSerializer: PropertySerializer<any, any, unknown>) {

        const serializers = this.aggregateSerializers(false);

        if (serializers.has(propSerializer.propertyName)) {
            throw new Error(`Unable to redefine/shadow serializer for "${propSerializer.propertyName}" property of "${this.name}"`);
        }

        const conflict = Array.from(serializers.values()).find(ps => ps.propertyTag === propSerializer.propertyTag);
        if (conflict) {
            throw new Error(
                `Unable to define serializer for "${propSerializer.propertyName}" property of "${this.name}": ` +
                `"${conflict.propertyTag}" tag already used by "${conflict.propertyName}" property`
            );
        }

        this.propertySerializers.set(propSerializer.propertyName, propSerializer);

    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(fallbackToDefaultProjection: boolean): Map<string, PropertySerializer<any, any, unknown>> {

        let serializers = new Map(this.propertySerializers); // clone

        if (fallbackToDefaultProjection) {

            const defaultMeta = MetadataManager.get(this.backend, DEFAULT_PROJECTION).getOwnMetaFor(this.proto);

            if (defaultMeta?.kind === PropertyBagMetadata.kind) {
                serializers = new Map([...defaultMeta.propertySerializers, ...serializers]);
            }

        }

        const inheritedMeta = MetadataManager.get(this.backend, this.projection).seekInheritedMetaFor(this.proto);

        if (inheritedMeta?.kind === PropertyBagMetadata.kind) {
            return new Map([...inheritedMeta.aggregateSerializers(fallbackToDefaultProjection), ...serializers]);
        } else {
            return serializers;
        }

    }

}
