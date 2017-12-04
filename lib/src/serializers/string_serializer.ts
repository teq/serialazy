import PrimitiveSerializer from './primitive_serializer';

/** Default serializer for strings */
class StringSerializer extends PrimitiveSerializer<string> {

    /*override*/ protected expectPrimitiveOrNil(maybeString: any): string {
        if (typeof(maybeString) === 'string') {
            return maybeString;
        } else if (maybeString instanceof String) {
            return maybeString.valueOf();
        } else if (maybeString === null || maybeString === undefined) {
            return maybeString;
        } else {
            throw new Error(`Not a string (typeof: "${typeof(maybeString)}", value: "${maybeString}")`);
        }
    }

}

export default StringSerializer;
