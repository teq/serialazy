import { DeflateOptions, DeflateOrInflateOptions, InflateOptions } from "./options";
import PropertySerializer from "./property_serializer";
import TypeSerializer from "./type_serializer";
import TypeSerializerPicker from "./type_serializer_picker";
import { isPromise } from './util';

export interface PropertyBag<T> {
    [prop: string]: T;
}

/** Returns a factory for object property serializers */
function ObjectPropertySerializer(backend: string) {

    return { create };

    /** Returns a property serializer for serializables which serialize to object-like (property bag) structures */
    function create<TSerialized, TOriginal>(
        proto: Object,
        propertyName: string,
        options?: TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options
    ): PropertySerializer<PropertyBag<TSerialized>, any, string> {

        const customTypeSerializer = options as TypeSerializer<TSerialized, TOriginal>;
        let { name: propertyTag, optional, nullable } = options || {};
        propertyTag = propertyTag || propertyName;

        function getTypeSerializer(options?: DeflateOrInflateOptions<TSerialized, TOriginal>) {

            try {
                const picker = TypeSerializerPicker<TSerialized, TOriginal>(backend, options);
                const defaultTypeSerializer = picker.pickForProp(proto, propertyName);
                return TypeSerializer.compile([defaultTypeSerializer, customTypeSerializer]);
            } catch (error) {
                const className = proto.constructor.name;
                throw new Error(`Unable to construct a type serializer for "${propertyName}" property of "${className}": ${error.message}`);
            }

        }

        function down(
            serializable: TOriginal,
            serialized: PropertyBag<TSerialized>,
            options?: DeflateOptions<TSerialized, TOriginal>
        ): void | Promise<void> {

            const putProperty = (value: TSerialized) => {
                if (value !== undefined) {
                    serialized[propertyTag] = value;
                }
            };

            try {
                const originalValue = (serializable as any)[propertyName];
                const serializedValue = getTypeSerializer(options).down(validate(originalValue), options);
                if (isPromise(serializedValue)) {
                    return (async () => putProperty(await serializedValue))();
                } else {
                    putProperty(serializedValue as TSerialized);
                }
            } catch (error) {
                const message = formatError(`Unable to serialize property "${propertyName}"`);
                throw new Error(`${message}: ${error.message}`);
            }

        }

        function up(
            serializable: TOriginal,
            serialized: PropertyBag<TSerialized>,
            options?: InflateOptions<TSerialized, TOriginal>
        ): void | Promise<void> {

            const putProperty = (value: TOriginal) => {
                value = validate(value);
                if (value !== undefined) {
                    (serializable as any)[propertyName] = value;
                }
            };

            try {
                const serializedValue = serialized[propertyTag];
                const originalValue = getTypeSerializer(options).up(serializedValue, options);
                if (isPromise(originalValue)) {
                    return (async () => putProperty(await originalValue))();
                } else {
                    putProperty(originalValue as TOriginal);
                }
            } catch (error) {
                const message = formatError(`Unable to deserialize property "${propertyName}"`);
                throw new Error(`${message}: ${error.message}`);
            }

        }

        function formatError(message: string) {
            return propertyName !== propertyTag ? `${message} (mapped to "${propertyTag}")` : message;
        }

        function validate<T>(value: T): T {

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

}

namespace ObjectPropertySerializer {

    /** Object property serializer options */
    export interface Options {

        /**
         * Indicates if property can be undefined
         * @remarks Applicable to properties
         * @defaultValue `false`
         */
        optional?: boolean;

        /**
         * Indicates if property can be null
         * @remarks Applicable to properties
         * @defaultValue `false`
         */
        nullable?: boolean;

        /**
         * When defined it forces to use different property name in serialized object
         * @remarks Applicable to properties
         */
        name?: string;

    }

}

export default ObjectPropertySerializer;
