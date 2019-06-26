import PropertySerializer from "./property_serializer";
import TypeSerializer from "./type_serializer";
import Provider from "./types/provider";

/** Represents a bag of serialized properties */
export interface PropertyBag<TSerialized> {
    [prop: string]: TSerialized;
}

/** Represents a property serializer for serializables which serialize to object-like (property bag) structures */
class ObjectPropertySerializer<TSerialized> implements PropertySerializer<PropertyBag<TSerialized>, any> {

    /**
     * Construct a new property serializer
     * @param propertyName Property name
     * @param typeSerializerProvider Type serializer for given property
     * @param options Serializer options
     */
    public constructor(
        private propertyName: string,
        private typeSerializerProvider: Provider<TypeSerializer<TSerialized, any>>,
        private options: ObjectPropertySerializer.Options = {}
    ) {}

    private get typeSerializer() {
        return this.typeSerializerProvider();
    }

    public down(serializable: any, serialized: PropertyBag<TSerialized>) {

        const [propertyName, mappedName] = [this.propertyName, this.options.name || this.propertyName];

        try {
            const originalValue = serializable[propertyName];
            const serializedValue = this.typeSerializer.down(this.validate(originalValue));
            if (serializedValue !== undefined) {
                serialized[mappedName] = serializedValue;
            }
        } catch (error) {
            throw new Error(`Unable to serialize property "${propertyName}": ${error.message}`);
        }

    }

    public up(serializable: any, serialized: PropertyBag<TSerialized>) {

        const [propertyName, mappedName] = [this.propertyName, this.options.name || this.propertyName];

        try {
            const serializedValue = serialized[mappedName];
            const originalValue = this.validate(this.typeSerializer.up(serializedValue));
            if (originalValue !== undefined) {
                serializable[propertyName] = originalValue;
            }
        } catch (error) {
            throw new Error(`Unable to deserialize property "${propertyName}": ${error.message}`);
        }

    }

    private validate(value: any) {

        if (!this.options.optional && value === undefined) {
            const hint = (typeof(this.options.optional) !== 'boolean') ? 'Hint: make it optional' : null;
            throw new Error(`Value is undefined${ hint ? `; ${hint}` : ''}`);
        }

        if (!this.options.nullable && value === null) {
            const hint = (typeof(this.options.nullable) !== 'boolean') ? 'Hint: make it nullable' : null;
            throw new Error(`Value is null${ hint ? `; ${hint}` : ''}`);
        }

        return value;

    }

}

namespace ObjectPropertySerializer {

    /** Object property serializer options */
    export interface Options {
        /** _(Applicable to properties)_ Indicates if property can be undefined. _Default:_ false. */
        optional?: boolean;
        /** _(Applicable to properties)_ Indicates if property can be null. Default: false */
        nullable?: boolean;
        /** _(Applicable to properties)_ Use different property name in serialized object. Default: use the same name */
        name?: string;
    }

}

export default ObjectPropertySerializer;
