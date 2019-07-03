import Constructor from './types/constructor';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Serializer function
     * @param original Original value
     * @returns Serialized value
     */
    down?(this: void, original: TOriginal): TSerialized;

    /**
     * Deserializer function
     * @param serialized Serialized value
     * @returns Original value
     */
    up?(this: void, serialized: TSerialized): TOriginal;

    /**
     * _Optional._ Original type constructor function.
     * Default: Value of `design:type` metadata for given property.
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    /** Compile type serializer partials to a final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<TypeSerializer<TSerialized, TOriginal>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const hints = (
            'Hints: Use a serializable type or provide a custom serializer. ' +
            'Specify property type explicitly, (details: https://github.com/Microsoft/TypeScript/issues/18995)'
        );

        const { down, up, type } = Object.assign({
            down: () => { throw new Error(`Serializer function ("down") for type "${typeName}" is not defined. ` + hints); },
            up: () => { throw new Error(`Deserializer function ("up") for type "${typeName}" is not defined. ` + hints); },
            type: null
        }, ...partials) as TypeSerializer<TSerialized, TOriginal>;

        const typeName = type && type.name ? type.name : '<unknown>';

        return { down, up, type };

    }

}

export default TypeSerializer;
