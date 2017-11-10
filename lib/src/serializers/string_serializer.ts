import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for strings */
class StringSerializer extends PrimitiveSerializer<string> {

    /*override*/ protected expectPrimitiveOrNil(value: any): string {
        if (typeof(value) === 'string') {
            return value;
        } else if (value instanceof String) {
            return value.valueOf();
        } else if (value === null || value === undefined) {
            return value;
        } else {
            throw new Error(`Not a string (typeof: "${typeof(value)}", value: "${value}")`);
        }
    }

}

export default StringSerializer;
