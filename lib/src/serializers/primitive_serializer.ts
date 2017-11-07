import JsonType from '../types/json_type';
import Serializer from './serializer';

/** Generic default serializer from primitive types */
abstract class PrimitiveSerializer<T extends string | number | boolean> implements Serializer<JsonType, T> {

    public down(value: any): JsonType {
        return this.expectPrimitiveOrNil(value);
    }

    public up(value: any): T {
        return this.expectPrimitiveOrNil(value);
    }

    protected abstract expectPrimitiveOrNil(value: any): T;

}

export default PrimitiveSerializer;
