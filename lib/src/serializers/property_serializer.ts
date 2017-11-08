import { JsonMap, JsonType } from '../types/json_type';
import TypeSerializer from './type_serializer';

/** Represents a property serializer */
class PropertySerializer {

    /**
     * Construct a new property serializer
     * @param propertyName Property name
     * @param typeSerializer Type serializer for given property
     * @param options Serializer options
     */
    public constructor(
        private propertyName: string,
        private typeSerializer: TypeSerializer<JsonType, any>,
        private options: PropertySerializer.Options = {}
    ) {}

    /** Performs property serialization */
    public down(serializable: any, serialized: JsonMap) {

        const [propertyName, mappedName] = [this.propertyName, this.options.name || this.propertyName];

        try {
            const originalValue = serializable[propertyName];
            const serializedValue = this.typeSerializer.down(this.validate(originalValue));
            if (serializedValue !== undefined) {
                serialized[mappedName] = this.typeSerializer.down(this.validate(originalValue)) as any;
            }
        } catch (error) {
            throw new Error(`Unable to serialize property "${propertyName}": ${error.message}`);
        }

    }

    /** Performs property deserialization */
    public up(serializable: any, serialized: JsonMap) {

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

namespace PropertySerializer {

    /** Serialize options */
    export interface Options {
        /** Indicates if property can be undefined. Default: false */
        optional?: boolean;
        /** Indicates if property can be null. Default: false */
        nullable?: boolean;
        /** Use different property name in serialized object. Default: use the same name */
        name?: string;
    }

}

export default PropertySerializer;
