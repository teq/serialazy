import SerializationError from '../errors/serialization_error';
import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for numbers */
class NumberSerializer extends PrimitiveSerializer<number> {

    /*override*/ protected expectPrimitiveOrNil(value: any): number {
        if (typeof(value) === 'number') {
            return value;
        } else if (value instanceof Number) {
            return value.valueOf();
        } else if (value === null || value === undefined) {
            return value;
        } else {
            throw new SerializationError(`Property "${this.propertyName}" (typeof: "${typeof(value)}", value: "${value}") is not a number`);
        }
    }

}

export default NumberSerializer;
