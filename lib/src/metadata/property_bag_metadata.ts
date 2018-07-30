import PropertySerializer from '../property_serializer';
import SerializableTypeMetadata from './serializable_type_metadata';

/** Metadata container for serializable property bags */
export default class PropertyBagMetadata extends SerializableTypeMetadata {

    private propSerializers = new Map<string, PropertySerializer<any, any>>();

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

    /** Add or update a property serializer */
    public setPropertySerializer(propName: string, propSerializer: PropertySerializer<any, any>) {

        if (this.aggregateSerializers().has(propName)) {
            throw new Error(`Unable to redefine/shadow serializer for property: ${propName}`);
        }

        this.propSerializers.set(propName, propSerializer);

    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(): Map<string, PropertySerializer<any, any>> {

        const inheritedMeta = this.manager.seekInheritedMetaFor<PropertyBagMetadata>(this.proto);

        if (inheritedMeta) {
            return new Map([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Map(this.propSerializers); // clone
        }

    }

}
