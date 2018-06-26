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
export default class JsonBooleanTypeSerializer implements TypeSerializer.Predefined<any, boolean> {

    public down(originalValue: any) {
        return expectBooleanOrNil(originalValue);
    }

    public up(serializedValue: any) {
        return expectBooleanOrNil(serializedValue);
    }

    public matchValue(value: any) {
        return typeof(value) === 'boolean' || value instanceof Boolean;
    }

    public matchType(type: Constructor<any>) {
        return type === Boolean;
    }

}
