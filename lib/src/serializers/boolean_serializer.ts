import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for booleans */
class BooleanSerializer extends PrimitiveSerializer<boolean> {

    /*override*/ protected expectPrimitiveOrNil(maybeBoolean: any): boolean {
        if (typeof(maybeBoolean) === 'boolean') {
            return maybeBoolean;
        } else if (maybeBoolean instanceof Boolean) {
            return maybeBoolean.valueOf();
        } else if (maybeBoolean === null || maybeBoolean === undefined) {
            return maybeBoolean;
        } else {
            throw new Error(`Not a boolean (typeof: "${typeof(maybeBoolean)}", value: "${maybeBoolean}")`);
        }
    }

}

export default BooleanSerializer;
