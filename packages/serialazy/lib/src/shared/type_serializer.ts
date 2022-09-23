import { DeflateOptions, InflateOptions } from './options';
import { Constructor } from './util';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Serializer function
     * @param original Original value
     * @param options Options passed to `deflate` function
     * @returns Serialized value
     */
    down?(
        original: TOriginal,
        options: DeflateOptions<TSerialized, TOriginal>
    ): TSerialized | Promise<TSerialized>;

    /**
     * Deserializer function
     * @param serialized Serialized value
     * @param options Options passed to `inflate` function
     * @returns Original value
     */
    up?(
        serialized: TSerialized,
        options: InflateOptions<TSerialized, TOriginal>
    ): TOriginal | Promise<TOriginal>;

    /**
     * Type of serializable
     * @defaultValue
     *   * For types: Type constructor function
     *   * For properties: Value of `design:type` metadata for given property
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    const hints = (
        'Hints: Use a serializable type or provide a custom serializer. ' +
        'Property type should be specified explicitly, details: https://github.com/Microsoft/TypeScript/issues/18995.'
    );

    /** Compile type serializer partials to a final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<TypeSerializer<TSerialized, TOriginal>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const { down, up, type } = Object.assign({
            down: () => { throw new Error(`Serializer function ("down") for type "${typeName}" is not defined. ` + hints); },
            up: () => { throw new Error(`Deserializer function ("up") for type "${typeName}" is not defined. ` + hints); },
            type: undefined
        }, ...partials) as TypeSerializer<TSerialized, TOriginal>;

        const typeName = type?.name || '<unknown>';

        return { down, up, type };

    }

}

export default TypeSerializer;
