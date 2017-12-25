
function expectBooleanOrNil(maybeBoolean: any): boolean {
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

/** JSON serializer for booleans */
export default {
    down: (originalValue: any) => expectBooleanOrNil(originalValue),
    up: (serializedValue: any) => expectBooleanOrNil(serializedValue)
};
