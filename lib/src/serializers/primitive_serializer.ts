import JsonType from '../types/json_type';
import TypeSerializer from './type_serializer';

/** Generic default serializer from primitive types */
abstract class PrimitiveSerializer<TPrimitive extends string | number | boolean> implements TypeSerializer<JsonType, TPrimitive> {

    public down(originalValue: TPrimitive): JsonType {
        return this.expectPrimitiveOrNil(originalValue);
    }

    public up(serializedValue: JsonType): TPrimitive {
        return this.expectPrimitiveOrNil(serializedValue);
    }

    protected abstract expectPrimitiveOrNil(maybePrimitive: any): TPrimitive;

}

export default PrimitiveSerializer;
