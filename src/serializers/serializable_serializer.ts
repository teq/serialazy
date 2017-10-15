import Constructable from '../constructable';
import SerializationError from '../errors/serialization_error';
import { JsonMap } from '../json_type';
import Jsonify from '../jsonify';
import Metadata from '../metadata';

import Serializer from './serializer';

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
        return Jsonify.toJsonObject(value);
    }

    public up(value: any): any {
        if (!this.options.optional && value === undefined) {
            throw new SerializationError(`Unable to deserialize undefined property: "${this.propertyName}". Hint: make it optional`);
        }
        if (!this.options.nullable && value === null) {
            throw new SerializationError(`Unable to deserialize null property: "${this.propertyName}". Hint: make it nullable`);
        }
        return Jsonify.fromJsonObject(this.ctor, value);
    }

}

export default SerializableSerializer;
