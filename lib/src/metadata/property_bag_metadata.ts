import PropertySerializer from '../property_serializer';
import TypeSerializer from '../type_serializer';
import GenericMetadata from './generic_metadata';

/** Metadata container for serializable property bag */
export default class PropertyBagMetadata extends GenericMetadata {

    public static readonly kind = Symbol.for('com.github.teq.serialazy.propertyBagMetadata');

    public readonly kind: typeof PropertyBagMetadata.kind = PropertyBagMetadata.kind;

    private propSerializers = new Map<string, PropertySerializer<any, any, unknown>>();

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
    public addPropertySerializer(propSerializer: PropertySerializer<any, any, unknown>) {

        const serializers = this.aggregateSerializers();

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

        this.propSerializers.set(propSerializer.propertyName, propSerializer);

    }

    /** Aggregates all property serializers: own and inherited */
    private aggregateSerializers(): Map<string, PropertySerializer<any, any, unknown>> {

        const inheritedMeta = this.manager.seekInheritedMetaFor(this.proto) as PropertyBagMetadata;

        if (inheritedMeta) {
            return new Map([...inheritedMeta.aggregateSerializers(), ...this.propSerializers]);
        } else {
            return new Map(this.propSerializers); // clone
        }

    }

}
