import JsonTypeSerializer from './json_type_serializer';

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
const jsonStringSerializer: JsonTypeSerializer<string> = {
    down: (originalValue: any) => expectStringOrNil(originalValue),
    up: (serializedValue: any) => expectStringOrNil(serializedValue)
};

export default jsonStringSerializer;
