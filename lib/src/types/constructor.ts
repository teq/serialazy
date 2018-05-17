
/** Represents constructor function which _may_ require arguments */
type Constructor<T> = new (...args: any[]) => T;

namespace Constructor {
    /** Represents default constructor function which doesn't require arguments */
    export type Default<T> = new () => T;
}

export default Constructor;
