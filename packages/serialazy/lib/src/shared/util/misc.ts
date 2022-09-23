
/** Asserts that value is `boolean` or `null | undefined`. Converts `Boolean` instance to `boolean`. */
export function expectBooleanOrNil(maybeBoolean: any): boolean {
    return expectTypeOrNil(maybeBoolean, Boolean, 'boolean');
}

/** Asserts that value is `number` or `null | undefined`. Converts `Number` instance to `number`. */
export function expectNumberOrNil(maybeNumber: any): number {
    return expectTypeOrNil(maybeNumber, Number, 'number');
}

/** Asserts that value is `string` or `null | undefined`. Converts `String` instance to `string`. */
export function expectStringOrNil(maybeString: any): string {
    return expectTypeOrNil(maybeString, String, 'string');
}

/** Check if target is a promise */
export function isPromise<T = unknown>(target: unknown): target is Promise<T> {
    return Promise.resolve(target) === target;
}

function expectTypeOrNil<T>(value: any, instanceOf: any, typeOf: string): T {
    if (typeof(value) === typeOf) {
        return value as T;
    } else if (value instanceof instanceOf) {
        return value.valueOf();
    } else if (value === null || value === undefined) {
        return value;
    } else {
        throw new Error(`Not a ${typeOf} (typeof: "${typeof(value)}", value: "${value}")`);
    }

}
