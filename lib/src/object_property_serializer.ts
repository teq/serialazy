import PropertySerializer from "./property_serializer";
import TypeSerializer from "./type_serializer";
import Provider from "./types/provider";

/** Represents a bag of serialized properties */
export interface PropertyBag<TSerialized> {
    [prop: string]: TSerialized;
}

/** Returns a property serializer for serializables which serialize to object-like (property bag) structures */
function ObjectPropertySerializer<TSerialized>(
    propertyName: string,
    typeSerializerProvider: Provider<TypeSerializer<TSerialized, any>>,
    options?: ObjectPropertySerializer.Options
): PropertySerializer<PropertyBag<TSerialized>, any, string> {

    let { name: propertyTag, optional, nullable } = (options || {}) as ObjectPropertySerializer.Options;
    propertyTag = propertyTag || propertyName;

    function down(serializable: any, serialized: PropertyBag<TSerialized>) {

        try {
            const originalValue = serializable[propertyName];
            const serializedValue = typeSerializerProvider().down(validate(originalValue));
            if (serializedValue !== undefined) {
                serialized[propertyTag] = serializedValue;
            }
        } catch (error) {
            const message = formatError(`Unable to serialize property "${propertyName}"`);
            throw new Error(`${message}: ${error.message}`);
        }

    }

    function up(serializable: any, serialized: PropertyBag<TSerialized>) {

        try {
            const serializedValue = serialized[propertyTag];
            const originalValue = validate(typeSerializerProvider().up(serializedValue));
            if (originalValue !== undefined) {
                serializable[propertyName] = originalValue;
            }
        } catch (error) {
            const message = formatError(`Unable to deserialize property "${propertyName}"`);
            throw new Error(`${message}: ${error.message}`);
        }

    }

    function formatError(message: string) {
        return propertyName !== propertyTag ? `${message} (mapped to "${propertyTag}")` : message;
    }

    function validate(value: any) {

        if (!optional && value === undefined) {
            const hint = (typeof(optional) !== 'boolean') ? 'Hint: make it optional' : null;
            throw new Error(`Value is undefined${ hint ? `; ${hint}` : ''}`);
        }

        if (!nullable && value === null) {
            const hint = (typeof(nullable) !== 'boolean') ? 'Hint: make it nullable' : null;
            throw new Error(`Value is null${ hint ? `; ${hint}` : ''}`);
        }

        return value;

    }

    return {
        propertyName,
        propertyTag,
        down,
        up
    };

}

namespace ObjectPropertySerializer {

    /** Object property serializer options */
    export interface Options {

        /** _(Applicable to properties)_ Indicates if property can be undefined. _Default:_ false. */
        optional?: boolean;

        /** _(Applicable to properties)_ Indicates if property can be null. Default: false */
        nullable?: boolean;

        /**
         * _(Applicable to properties)_
         * When defined it forces to use different property name in serialized object.
         * Also referred to as: mapped (property) name or "tag".
         */
        name?: string;

    }

}

export default ObjectPropertySerializer;
