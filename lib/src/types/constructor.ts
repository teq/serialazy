
/** Represents constructor function which _may_ require arguments */
type Constructor<T> = new (...args: any[]) => T;

export default Constructor;
