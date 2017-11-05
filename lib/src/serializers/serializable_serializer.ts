import { deflate, inflate } from '../serialazy';
import Constructable from '../types/constructable';
import { JsonMap } from '../types/json_type';
import Serializer from './serializer';

/** Default serializer for 'serializable' types */
class SerializableSerializer implements Serializer<JsonMap, any> {

    public constructor(
        private options: Serializer.Options,
        private ctor: Constructable<any>
    ) {}

    public down(value: any): JsonMap {
        if (!this.options.optional && value === undefined) {
            throw new Error('Value is undefined. Hint: make it optional');
        }
        if (!this.options.nullable && value === null) {
            throw new Error('Value is null. Hint: make it nullable');
        }
        return deflate(value);
    }

    public up(value: any): any {
        if (!this.options.optional && value === undefined) {
            throw new Error('Value is undefined. Hint: make it optional');
        }
        if (!this.options.nullable && value === null) {
            throw new Error('Value is null. Hint: make it nullable');
        }
        return inflate(this.ctor, value);
    }

}

export default SerializableSerializer;
