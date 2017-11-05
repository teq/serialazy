import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for booleans */
class BooleanSerializer extends PrimitiveSerializer<boolean> {

    /*override*/ protected expectPrimitiveOrNil(value: any): boolean {
        if (typeof(value) === 'boolean') {
            return value;
        } else if (value instanceof Boolean) {
            return value.valueOf();
        } else if (value === null || value === undefined) {
            return value;
        } else {
            throw new Error(`Not a boolean (typeof: "${typeof(value)}", value: "${value}")`);
        }
    }

}

export default BooleanSerializer;
