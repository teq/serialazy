
namespace Util {

    export function expectBooleanOrNil(maybeBoolean: any): boolean {
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

    export function expectNumberOrNil(maybeNumber: any): number {
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

    export function expectStringOrNil(maybeString: any): string {
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

export default Util;
