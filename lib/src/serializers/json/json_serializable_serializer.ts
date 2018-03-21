import { deflate, inflate } from '../../serialazy';
import Constructable from '../../types/constructable';
import { JsonMap } from '../../types/json_type';

/** JSON serializer for serializables */
export default (type: Constructable.Default<any>) => ({
    type,
    down: (value: any) => deflate(value),
    up: (value: any) => inflate(type, value)
});
