import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for numbers */
class NumberSerializer extends PrimitiveSerializer<number> {

    /*override*/ protected expectPrimitiveOrNil(maybeNumber: any): number {
        if (typeof(maybeNumber) === 'number') {
            return maybeNumber;
        } else if (maybeNumber instanceof Number) {
            return maybeNumber.valueOf();
        } else if (maybeNumber === null || maybeNumber === undefined) {
            return maybeNumber;
        } else {
            throw new Error(`Not a number (typeof: "${typeof(maybeNumber)}", value: "${maybeNumber}")`);
        }
    }

}

export default NumberSerializer;
