import JsonType from '../json_type';
import Serializer from '../serializer';
import SerializationError from './serialization_error';

/** Generic default serializer from primitive types */
abstract class PrimitiveSerializer<T extends string | number | boolean> implements Serializer<JsonType, T> {

    public constructor(
        protected propertyName: string,
        protected options: Serializer.Options
    ) {}

    public down(value: any): JsonType {
        if (!this.options.optional && value === undefined) {
            throw new SerializationError(`Unable to serialize undefined property: "${this.propertyName}". Hint: make it optional`);
        }
        if (!this.options.nullable && value === null) {
            throw new SerializationError(`Unable to serialize null property: "${this.propertyName}". Hint: make it nullable`);
        }
        return this.expectPrimitiveOrNil(value);
    }

    public up(value: any): T {
        if (!this.options.optional && value === undefined) {
            throw new SerializationError(`Unable to deserialize undefined property: "${this.propertyName}". Hint: make it optional`);
        }
        if (!this.options.nullable && value === null) {
            throw new SerializationError(`Unable to deserialize null property: "${this.propertyName}". Hint: make it nullable`);
        }
        return this.expectPrimitiveOrNil(value);
    }

    protected abstract expectPrimitiveOrNil(value: any): T;

}

export default PrimitiveSerializer;
