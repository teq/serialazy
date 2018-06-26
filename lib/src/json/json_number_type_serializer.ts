import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';

function expectNumberOrNil(maybeNumber: any): number {
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

/** JSON serializer for numbers */
export default class JsonNumberTypeSerializer implements TypeSerializer<any, number> {

    public down(originalValue: any) {
        return expectNumberOrNil(originalValue);
    }

    public up(serializedValue: any) {
        return expectNumberOrNil(serializedValue);
    }

    public matchValue(value: any) {
        return typeof(value) === 'number' || value instanceof Number;
    }

    public matchType(type: Constructor<any>) {
        return type === Number;
    }

}
