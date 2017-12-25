import { deepMerge, isSerializable } from '../serialazy';
import { JsonMap, JsonType } from '../types/json_type';
import Provider from '../types/provider';
import TypeSerializer from './type_serializer';

/** Reporesents an abstract property serializer */
interface PropertySerializer {

    /** Serializes target property in `serializable` and writes value to `serialized` */
    down(serializable: any, serialized: JsonMap): void;

    /** Deserializes target property from `serialized` and writes value to `serializable` */
    up(serializable: any, serialized: JsonMap): void;

    /**
     * Assigns target property in `destination` to corresponding property value from `source`. Mutates `destination`.
     * @param destination Destination serializable class instance
     * @param source Source class instance or plain object, may be non-serializable
     * @returns Destination class instance
     */
    assign<T>(destination: T, source: T): T;

}

/** Contains property serializer implementations */
namespace PropertySerializer {

    /** Represents a regular configurable property serializer */
    export class Configurable implements PropertySerializer {

        /**
         * Construct a new property serializer
         * @param propertyName Property name
         * @param typeSerializerProvider Type serializer for given property
         * @param options Serializer options
         */
        public constructor(
            private propertyName: string,
            private typeSerializerProvider: Provider<TypeSerializer<JsonType, any>>,
            private options: Configurable.Options = {}
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

        public assign(destination: any, source: any) {

            if (destination === null || destination === undefined) {
                throw new Error('Expecting `destination` to be not null/undefined');
            }

            if (source === null || source === undefined) {
                throw new Error('Expecting `source` to be not null/undefined');
            }

            const type = (() => { // fetch type
                if (this.typeSerializer.discriminate) {
                    if (source[this.propertyName] === null || source[this.propertyName] === undefined) {
                        throw new Error('Unable to discriminate property type when property value is null/undefined');
                    }
                    return this.typeSerializer.discriminate(source[this.propertyName]);
                } else {
                    return this.typeSerializer.type;
                }
            })();

            if (type && isSerializable(type)) {
                destination[this.propertyName] = deepMerge(new type(), source[this.propertyName]);
            } else {
                destination[this.propertyName] = source[this.propertyName];
            }

            return destination;

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

    export namespace Configurable {

        /** Configurable property serializer options */
        export interface Options {
            /** Indicates if property can be undefined. Default: false */
            optional?: boolean;
            /** Indicates if property can be null. Default: false */
            nullable?: boolean;
            /** Use different property name in serialized object. Default: use the same name */
            name?: string;
        }

    }


    /** Represents a dummy property serializer which does nothing */
    export class Dummy implements PropertySerializer {

        public down(serializable: any, serialized: JsonMap) { /* do nothing */ }

        public up(serializable: any, serialized: JsonMap) { /* do nothing */ }

        public assign(destination: any, source: any) { return destination; }

    }

}

export default PropertySerializer;
