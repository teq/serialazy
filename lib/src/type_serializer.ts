import Constructor from './types/constructor';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Property value serializer
     * @param original Original property value
     * @returns Serialized property value
     */
    down(original: TOriginal): TSerialized;

    /**
     * Property value deserializer
     * @param serialized Serialized property value
     * @returns Original property value
     */
    up(serialized: TSerialized): TOriginal;

    /**
     * _Optional._ Original type constructor function.
     * Default: Value of `design:type` metadata for given property.
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    /** Represents a type which can be matched against a value or a type */
    export interface Matchable {

        /** Check if it matches given value */
        matchValue(value: any): boolean;

        /** Check if it matches given type */
        matchType(type: Constructor<any>): boolean;

    }

    /** Compile type serializer partials to a final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<Partial<TypeSerializer<TSerialized, TOriginal>>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const hints = (
            'Hints: Use serializable type or provide a custom serializer. ' +
            'Specify property type explicitly, (details: https://github.com/Microsoft/TypeScript/issues/18995)'
        );

        const { down, up, type } = partials.reduce((compiled, partial) => {

            const typeName = partial.type && partial.type.name ? partial.type.name : '<unknown>';

            return Object.assign(compiled, {
                down: (original: TOriginal) => partial.down ? partial.down(original) : (() => {
                    throw new Error(`Serializer function ("down") for type "${typeName}" is not defined. ` + hints);
                })(),
                up: (serialized: TSerialized) => partial.up ? partial.up(serialized) : (() => {
                    throw new Error(`Deserializer function ("up") for type "${typeName}" is not defined. ` + hints);
                })(),
                type: partial.type
            });

        }, {});

        return { down, up, type };

    }

}

export default TypeSerializer;
