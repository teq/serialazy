import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';

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
const jsonBooleanTypeSerializer: TypeSerializer<any, boolean> = {
    down: (originalValue: any) => expectBooleanOrNil(originalValue),
    up: (serializedValue: any) => expectBooleanOrNil(serializedValue),
};

export default Object.assign(jsonBooleanTypeSerializer, {
    matchValue: (value: any) => typeof(value) === 'boolean' || value instanceof Boolean,
    matchType: (type: Constructor<any>) => type === Boolean
});
