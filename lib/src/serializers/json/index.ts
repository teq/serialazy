import Constructor from '../../types/constructor';
import TypeSerializer from '../type_serializer';
import jsonBooleanTypeSerializer from './json_boolean_type_serializer';
import jsonNumberTypeSerializer from './json_number_type_serializer';
import jsonStringTypeSerializer from './json_string_type_serializer';

const predefinedJsonSerializers = [
    jsonBooleanTypeSerializer,
    jsonNumberTypeSerializer,
    jsonStringTypeSerializer
];

export default Object.assign(predefinedJsonSerializers, {
    pickForValue: (value: any) => predefinedJsonSerializers.find(serializer => serializer.matchValue(value)),
    pickForType: (type: Constructor<any>) => predefinedJsonSerializers.find(serializer => serializer.matchType(type))
});
