import { isSerializable } from '../../serialazy';
import Constructable from '../../types/constructable';
import JsonType from '../../types/json_type';
import TypeSerializer from '../type_serializer';
import jsonBooleanSerializer from './json_boolean_serializer';
import jsonNumberSerializer from './json_number_serializer';
import jsonSerializableSerializer from './json_serializable_serializer';
import jsonStringSerializer from './json_string_serializer';

/** JSON type serializer */
type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

namespace JsonTypeSerializer {

    /** Try to pick a (possibly partial) type serializer for given property */
    export function pickFor(proto: Object, propertyName: string): Partial<JsonTypeSerializer<any>> {

        const type: Constructable.Default<any> = Reflect.getMetadata('design:type', proto, propertyName);

        if (type === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        if (type === String) {
            return jsonStringSerializer;
        } else if (type === Number) {
            return jsonNumberSerializer;
        } else if (type === Boolean) {
            return jsonBooleanSerializer;
        } else if (isSerializable(type)) {
            return jsonSerializableSerializer(type);
        } else {
            // Unable to pick type serializer, expecting user to provide custom one
            return { type };
        }

    }

}

export default JsonTypeSerializer;
