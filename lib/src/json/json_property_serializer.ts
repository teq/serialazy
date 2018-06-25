import PropertySerializer from "../property_serializer";
import { JsonMap } from "../types/json_type";
import Provider from "../types/provider";
import JsonTypeSerializer from "./json_type_serializer";

/** Represents a JSON property serializer */
export class JsonPropertySerializer implements PropertySerializer<JsonMap, any> {

    /**
     * Construct a new property serializer
     * @param propertyName Property name
     * @param typeSerializerProvider Type serializer for given property
     * @param options Serializer options
     */
    public constructor(
        private propertyName: string,
        private typeSerializerProvider: Provider<JsonTypeSerializer<any>>,
        private options: JsonPropertySerializer.Options = {}
    ) {}

    private get typeSerializer() {
        return this.typeSerializerProvider();
    }

    public down(serializable: any, serialized: JsonMap) {

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

export namespace JsonPropertySerializer {

    /** JSON property serializer options */
    export interface Options {
        /** Indicates if property can be undefined. Default: false */
        optional?: boolean;
        /** Indicates if property can be null. Default: false */
        nullable?: boolean;
        /** Use different property name in serialized object. Default: use the same name */
        name?: string;
    }

}

export default JsonPropertySerializer;
