import { deflate, inflate } from '../serialazy';
import Constructable from '../types/constructable';
import { JsonMap } from '../types/json_type';
import Serializer from './serializer';

/** Default serializer for 'serializable' types */
class SerializableSerializer implements Serializer<JsonMap, any> {

    public constructor(
        private ctor: Constructable<any>
    ) {}

    public down(value: any): JsonMap {
        return deflate(value);
    }

    public up(value: any): any {
        return inflate(this.ctor, value);
    }

}

export default SerializableSerializer;
