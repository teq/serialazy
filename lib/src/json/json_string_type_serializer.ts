import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';

function expectStringOrNil(maybeString: any): string {
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

/** JSON serializer for strings */
export default class JsonStringTypeSerializer implements TypeSerializer<any, string> {

    public down(originalValue: any) {
        return expectStringOrNil(originalValue);
    }

    public up(serializedValue: any) {
        return expectStringOrNil(serializedValue);
    }

    public matchValue(value: any) {
        return typeof(value) === 'string' || value instanceof String;
    }

    public matchType(type: Constructor<any>) {
        return type === String;
    }

}
