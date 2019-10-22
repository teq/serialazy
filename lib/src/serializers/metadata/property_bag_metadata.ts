import PropertySerializer from '../property_serializer';
import { getOwnMetaFor, seekForInheritedMetaFor, setMetaFor } from './';
import SerializableTypeMetadata from './serializable_type_metadata';

/** Metadata container for serializable property bags */
export default class PropertyBagMetadata extends SerializableTypeMetadata {

    public readonly type = SerializableTypeMetadata.Type.PROP_BAG;

    private propSerializers = new Map<string, PropertySerializer<any, any>>();

    /** Get type serializer from a property bag metadata */
    public getTypeSerializer() {

        return {

            type: this.ctor,

            down: (serializable: any) => {

                let serialized: {};

                if (serializable === null || serializable === undefined) {
                    serialized = serializable;
                } else {
                    serialized = {};
                    try {
                        this.aggregateSerializers().forEach(serializer => serializer.down(serializable, serialized));
                    } catch (error) {
                        throw new Error(`Unable to serialize an instance of a class "${this.name}": ${error.message}`);
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
                        this.aggregateSerializers().forEach(serializer => serializer.up(serializable, serialized));
                    } catch (error) {
                        throw new Error(`Unable to deserialize an instance of a class "${this.name}": ${error.message}`);
                    }
                }

                return serializable;

            }

        };

    }

    /** Add property serializer */
    public setPropertySerializer(propName: string, propSerializer: PropertySerializer<any, any>) {
        if (this.aggregateSerializers().has(propName)) {
            throw new Error(`Unable to redefine/shadow serializer for property: ${propName}`);
        }
        this.propSerializers.set(propName, propSerializer);
    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(): Map<string, PropertySerializer<any, any>> {

        const inheritedMeta = seekForInheritedMetaFor<PropertyBagMetadata>(this.proto);

        if (inheritedMeta) {
            return new Map([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Map(this.propSerializers); // clone
        }

    }

    /** Get own metadata for given prototype if it's exists or create an empty metadata container */
    public static getOrCreateFor(proto: Object): PropertyBagMetadata {

        let metadata = getOwnMetaFor<PropertyBagMetadata>(proto);

        if (!metadata) {
            const inherited = seekForInheritedMetaFor(proto);
            if (inherited && inherited.type === SerializableTypeMetadata.Type.CUSTOM) {
                throw new Error('A property-bag serializable can\'t inherit from a type with custom serializer');
            }
            metadata = new PropertyBagMetadata(proto);
            setMetaFor(proto, metadata);
        } else if (metadata.type !== SerializableTypeMetadata.Type.PROP_BAG) {
            throw new Error('Can\'t define property serializers on type which has a custom serializer');
        }

        return metadata;

    }

}
