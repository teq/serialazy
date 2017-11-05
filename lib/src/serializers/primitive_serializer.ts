import JsonType from '../types/json_type';
import Serializer from './serializer';

/** Generic default serializer from primitive types */
abstract class PrimitiveSerializer<T extends string | number | boolean> implements Serializer<JsonType, T> {

    public constructor(
        protected options: Serializer.Options
    ) {}

    public down(value: any): JsonType {
        if (!this.options.optional && value === undefined) {
            throw new Error('Value is undefined. Hint: make it optional');
        }
        if (!this.options.nullable && value === null) {
            throw new Error('Value is null. Hint: make it nullable');
        }
        return this.expectPrimitiveOrNil(value);
    }

    public up(value: any): T {
        if (!this.options.optional && value === undefined) {
            throw new Error('Value is undefined. Hint: make it optional');
        }
        if (!this.options.nullable && value === null) {
            throw new Error('Value is null. Hint: make it nullable');
        }
        return this.expectPrimitiveOrNil(value);
    }

    protected abstract expectPrimitiveOrNil(value: any): T;

}

export default PrimitiveSerializer;
