import { deflate, inflate } from '../../serialazy';
import Constructable from '../../types/constructable';
import { JsonMap } from '../../types/json_type';
import JsonTypeSerializer from './json_type_serializer';

/** JSON serializer for non-primitive serializables */
const jsonSerializableSerializer: ((type: Constructable.Default<any>) => JsonTypeSerializer<any>) = (type) => ({
    type,
    down: (value: any) => deflate(value),
    up: (value: any) => inflate(type, value)
});

export default jsonSerializableSerializer;
