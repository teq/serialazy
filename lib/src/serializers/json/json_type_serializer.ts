import { isSerializable } from '../../serialazy';
import Constructable from '../../types/constructable';
import JsonType from '../../types/json_type';
import TypeSerializer from '../type_serializer';
import jsonBooleanTypeSerializer from './json_boolean_type_serializer';
import jsonNumberTypeSerializer from './json_number_type_serializer';
import jsonSerializableTypeSerializer from './json_serializable_type_serializer';
import jsonStringTypeSerializer from './json_string_type_serializer';

/** JSON type serializer */
type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

namespace JsonTypeSerializer {

    /** Try to pick a (possibly partial) type serializer for given type */
    export function pickForType(type: Constructable.Default<any>): Partial<JsonTypeSerializer<any>> {

        if (!type) {
            throw new Error('Expecting a type');
        } else if (type === String) {
            return jsonStringTypeSerializer;
        } else if (type === Number) {
            return jsonNumberTypeSerializer;
        } else if (type === Boolean) {
            return jsonBooleanTypeSerializer;
        } else if (isSerializable(type)) { // non-primitive serializable
            return jsonSerializableTypeSerializer(type);
        } else {
            // Unable to pick type serializer, expecting user to provide custom one
            return { type };
        }

    }

    /** Try to pick a (possibly partial) type serializer for given property */
    export function pickForProp(proto: Object, propertyName: string): Partial<JsonTypeSerializer<any>> {

        const type: Constructable.Default<any> = Reflect.getMetadata('design:type', proto, propertyName);

        if (type === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        return pickForType(type);

    }

}

export default JsonTypeSerializer;
