import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonBooleanTypeSerializer from './json_boolean_type_serializer';
import JsonNumberTypeSerializer from './json_number_type_serializer';
import JsonStringTypeSerializer from './json_string_type_serializer';
import JsonType from './json_type';

type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

namespace JsonTypeSerializer {

    const picker = new TypeSerializer.Picker<JsonType>('json', [
        new JsonBooleanTypeSerializer(),
        new JsonNumberTypeSerializer(),
        new JsonStringTypeSerializer()
    ]);

    export const pickForValue = (value: any) => picker.pickForValue(value);
    export const pickForType = (type: Constructor<any>) => picker.pickForType(type);
    export const pickForProp = (proto: Object, propertyName: string) => picker.pickForProp(proto, propertyName);

}

export default JsonTypeSerializer;
