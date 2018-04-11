import PropertySerializer from '../property_serializer';
import SerializableTypeMetadata from './serializable_type_metadata';

/** Metadata container for serializable property bags */
export default class PropertyBagMetadata extends SerializableTypeMetadata {

    public readonly type = SerializableTypeMetadata.Type.PROP_BAG;

    private propSerializers = new Set<PropertySerializer<any, any>>();

    /** Get type serializer from a property bag metadata */
    public getTypeSerializer() {

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

    /** Add property serializer */
    public addPropertySerializer(propSerializer: PropertySerializer<any, any>) {
        this.propSerializers.add(propSerializer);
    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(): Set<PropertySerializer<any, any>> {

        const inheritedMeta = SerializableTypeMetadata.seekForInheritedMetaFor<PropertyBagMetadata>(this.proto);

        if (inheritedMeta) {
            return new Set([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Set(this.propSerializers); // clone
        }

    }

    /** Get own metadata for given prototype if it's exists or create an empty metadata container */
    public static getOrCreateFor(proto: Object): PropertyBagMetadata {

        let metadata = this.getFor<PropertyBagMetadata>(proto);

        if (!metadata) {
            const inherited = this.seekForInheritedMetaFor(proto);
            if (inherited && inherited.type === SerializableTypeMetadata.Type.CUSTOM) {
                throw new Error('Can\'t define property serializers on type which inherits from a type with custom serializer');
            }
            metadata = new PropertyBagMetadata(proto);
            this.setFor(proto, metadata);
        } else if (metadata.type !== SerializableTypeMetadata.Type.PROP_BAG) {
            throw new Error('Can\'t define property serializers on type which has a custom serializer');
        }

        return metadata;

    }

}
