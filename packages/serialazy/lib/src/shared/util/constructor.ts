
/** Represents constructor function which require no arguments */
export type Constructor<T> = new () => T;

/** Check if target is constructor function */
export function isConstructor<T = unknown>(target: unknown): target is Constructor<T> {
    return typeof target === 'function' && target.prototype && target.prototype.constructor.name;
}
