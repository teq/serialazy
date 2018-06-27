import JsonType from '../json/json_type';
import SerializationBackend from '../serialization_backend';
import JsonBooleanTypeSerializer from './json_boolean_type_serializer';
import JsonNumberTypeSerializer from './json_number_type_serializer';
import JsonStringTypeSerializer from './json_string_type_serializer';

export default {
    name: 'json',
    predefinedSerializers: [
        new JsonBooleanTypeSerializer(),
        new JsonNumberTypeSerializer(),
        new JsonStringTypeSerializer()
    ]
} as SerializationBackend<JsonType>;
