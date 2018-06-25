import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonType from '../types/json_type';
import jsonBooleanTypeSerializer from './json_boolean_type_serializer';
import jsonNumberTypeSerializer from './json_number_type_serializer';
import jsonStringTypeSerializer from './json_string_type_serializer';

const predefinedJsonSerializers = [
    jsonBooleanTypeSerializer,
    jsonNumberTypeSerializer,
    jsonStringTypeSerializer
];

interface SerializationBackend<TSerialized> {
    name: string;
    predefinedSerializers: SerializationBackend.PredefinedSerializers<TSerialized>;
}

namespace SerializationBackend {
    export interface PredefinedSerializers<TSerialized> extends Array<TypeSerializer<TSerialized, any>> {
        pickForValue(value: any): TypeSerializer<TSerialized, any>;
        pickForType(type: Constructor<any>): TypeSerializer<TSerialized, any>;
    }
}

const backend: SerializationBackend<JsonType> = {
    name: 'json',
    predefinedSerializers: Object.assign(predefinedJsonSerializers, {
        pickForValue: (value: any) => predefinedJsonSerializers.find(serializer => serializer.matchValue(value)),
        pickForType: (type: Constructor<any>) => predefinedJsonSerializers.find(serializer => serializer.matchType(type))
    })
};

export { SerializationBackend };

export default backend;
