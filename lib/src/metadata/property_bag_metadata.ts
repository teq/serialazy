import PropertySerializer from '../property_serializer';
import TypeSerializer from '../type_serializer';
import GenericMetadata from './generic_metadata';

/** Metadata container for serializable property bag */
export default class PropertyBagMetadata extends GenericMetadata {

    public static readonly kind = Symbol.for('com.github.teq.serialazy.propertyBagMetadata');

    public readonly kind: typeof PropertyBagMetadata.kind = PropertyBagMetadata.kind;

    private propSerializers = new Map<string, PropertySerializer<any, any>>();

    public getTypeSerializer(): TypeSerializer<any, any> {

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
                        throw new Error(`Unable to serialize an instance of "${this.name}": ${error.message}`);
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
                        throw new Error(`Unable to deserialize an instance of "${this.name}": ${error.message}`);
                    }
                }

                return serializable;

            }

        };

    }

    /** Add or update a property serializer */
    public setPropertySerializer(propName: string, propSerializer: PropertySerializer<any, any>) {

        if (this.aggregateSerializers().has(propName)) {
            throw new Error(`Unable to redefine/shadow serializer for "${propName}" property of "${this.name}"`);
        }

        this.propSerializers.set(propName, propSerializer);

    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(): Map<string, PropertySerializer<any, any>> {

        const inheritedMeta = this.manager.seekInheritedMetaFor(this.proto) as PropertyBagMetadata;

        if (inheritedMeta) {
            return new Map([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Map(this.propSerializers); // clone
        }

    }

}
