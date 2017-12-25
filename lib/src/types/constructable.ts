
/** Represents constructor function which _may_ require arguments */
type Constructable<T> = new (...args: any[]) => T;

namespace Constructable {
    /** Represents default constructor function which doesn't require arguments */
    export type Default<T> = new () => T;
}

export default Constructable;
