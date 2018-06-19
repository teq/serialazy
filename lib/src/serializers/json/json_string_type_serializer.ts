import Constructor from '../../types/constructor';
import TypeSerializer from '../type_serializer';

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
const jsonStringTypeSerializer: TypeSerializer<any, string> = {
    down: (originalValue: any) => expectStringOrNil(originalValue),
    up: (serializedValue: any) => expectStringOrNil(serializedValue)
};

export default Object.assign(jsonStringTypeSerializer, {
    matchValue: (value: any) => typeof(value) === 'string' || value instanceof String,
    matchType: (type: Constructor<any>) => type === String
});
