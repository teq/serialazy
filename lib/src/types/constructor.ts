
/** Represents constructor function which _may_ require arguments */
export type Constructor<T> = new (...args: any[]) => T;

/** Check if target is constructor function */
export function isConstructor<T = unknown>(target: unknown): target is Constructor<T> {
    return typeof target === 'function' && target.prototype && target.prototype.constructor.name;
}

export default Constructor;
