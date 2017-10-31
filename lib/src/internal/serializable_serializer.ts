import { deflate, inflate } from '../serialazy';
import Constructable from '../types/constructable';
import { JsonMap } from '../types/json_type';
import Serializer from '../types/serializer';
import SerializationError from './serialization_error';

/** Default serializer for 'serializable' types */
class SerializableSerializer implements Serializer<JsonMap, any> {

    public constructor(
        private propertyName: string,
        private options: Serializer.Options,
        private ctor: Constructable<any>
    ) {}

    public down(value: any): JsonMap {
        if (!this.options.optional && value === undefined) {
            throw new SerializationError(`Unable to serialize undefined property: "${this.propertyName}". Hint: make it optional`);
        }
        if (!this.options.nullable && value === null) {
            throw new SerializationError(`Unable to serialize null property: "${this.propertyName}". Hint: make it nullable`);
        }
        return deflate(value);
    }

    public up(value: any): any {
        if (!this.options.optional && value === undefined) {
            throw new SerializationError(`Unable to deserialize undefined property: "${this.propertyName}". Hint: make it optional`);
        }
        if (!this.options.nullable && value === null) {
            throw new SerializationError(`Unable to deserialize null property: "${this.propertyName}". Hint: make it nullable`);
        }
        return inflate(this.ctor, value);
    }

}

export default SerializableSerializer;
