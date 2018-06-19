import Constructor from '../../types/constructor';
import JsonType from '../../types/json_type';
import SerializableTypeMetadata from '../metadata/serializable_type_metadata';
import TypeSerializer from '../type_serializer';
import predefinedJsonSerializers from './';

/** JSON type serializer */
type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

namespace JsonTypeSerializer {

    /** Try to pick a (possibly partial) type serializer for given value */
    export function pickForValue(value: any): Partial<JsonTypeSerializer<any>> {

        let serializer: Partial<JsonTypeSerializer<any>> = {};

        if (value === null || value === undefined) {
            throw new Error('Expecting value to be not null/undefined');
        } else if (!(serializer = predefinedJsonSerializers.pickForValue(value))) {
            const type = value.constructor;
            if (typeof(type) !== 'function') {
                throw new Error(`Expecting value to have a constructor function`);
            }
            const meta = SerializableTypeMetadata.getOwnOrInheritedMetaFor(Object.getPrototypeOf(value));
            if (meta) {
                serializer = meta.getTypeSerializer();
            } else { // unable to pick a type serializer
                serializer = { type };
            }
        }

        return serializer;

    }

    /** Try to pick a (possibly partial) type serializer for given type */
    export function pickForType(type: Constructor<any>): Partial<JsonTypeSerializer<any>> {

        let serializer: Partial<JsonTypeSerializer<any>> = {};

        if (typeof(type) !== 'function') {
            throw new Error('Expecting a type constructor function');
        } else if (!(serializer = predefinedJsonSerializers.pickForType(type))) {
            const meta = SerializableTypeMetadata.getOwnOrInheritedMetaFor(type.prototype);
            if (meta) {
                serializer = meta.getTypeSerializer();
            } else { // unable to pick a type serializer
                serializer = { type };
            }
        }

        return serializer;

    }

    /** Try to pick a (possibly partial) type serializer for given property */
    export function pickForProp(proto: Object, propertyName: string): Partial<JsonTypeSerializer<any>> {

        const type: Constructor<any> = Reflect.getMetadata('design:type', proto, propertyName);

        if (type === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        return pickForType(type);

    }

}

export default JsonTypeSerializer;
