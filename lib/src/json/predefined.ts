import Constructor from "../types/constructor";
import JsonSerializable from "./json_serializable";

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

// *** Declare pre-defined serializers ***

JsonSerializable.Type({
    down: (original: any) => expectBooleanOrNil(original),
    up: (serialized: any) => expectBooleanOrNil(serialized)
})(Boolean as any as Constructor<boolean>);

JsonSerializable.Type({
    down: (original: any) => expectNumberOrNil(original),
    up: (serialized: any) => expectNumberOrNil(serialized)
})(Number as any as Constructor<number>);

JsonSerializable.Type({
    down: (original: any) => expectStringOrNil(original),
    up: (serialized: any) => expectStringOrNil(serialized)
})(String as any as Constructor<string>);
