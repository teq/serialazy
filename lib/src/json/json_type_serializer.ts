import { MetadataManager } from '../metadata';
import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonBooleanTypeSerializer from './json_boolean_type_serializer';
import JsonNumberTypeSerializer from './json_number_type_serializer';
import JsonStringTypeSerializer from './json_string_type_serializer';
import JsonType from './json_type';

type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

const predefinedSerializers = [
    new JsonBooleanTypeSerializer(),
    new JsonNumberTypeSerializer(),
    new JsonStringTypeSerializer()
];

namespace JsonTypeSerializer {

    /** Try to pick a (possibly partial) type serializer for given value */
    export function pickForValue(value: any): Partial<JsonTypeSerializer<any>> {

        let serializer: Partial<JsonTypeSerializer<any>> = {};

        if (value === null || value === undefined) {
            throw new Error('Expecting value to be not null/undefined');
        } else if (!(serializer = predefinedSerializers.find(s => s.matchValue(value)))) {
            const type = value.constructor;
            if (typeof(type) !== 'function') {
                throw new Error(`Expecting value to have a constructor function`);
            }
            const proto = Object.getPrototypeOf(value);
            const meta = MetadataManager.get().getOwnOrInheritedMetaFor(proto);
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
        } else if (!(serializer = predefinedSerializers.find(s => s.matchType(type)))) {
            const meta = MetadataManager.get().getOwnOrInheritedMetaFor(type.prototype);
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
