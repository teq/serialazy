import Constructor from './types/constructor';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Property value serializer
     * @param originalValue Original property value
     * @returns Serialized property value
     */
    down(this: void, originalValue: TOriginal): TSerialized;

    /**
     * Property value deserializer
     * @param serializedValue Serialized property value
     * @returns Original property value
     */
    up(this: void, serializedValue: TSerialized): TOriginal;

    /**
     * _Optional._ Original type constructor function.
     * Default: Value of `design:type` metadata for given property.
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    /** Compile type serializer partials to final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<Partial<TypeSerializer<TSerialized, TOriginal>>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const { down, up, type } = partials.reduce((compiled, partial) => ({ ...compiled, ...partial }), {});

        if (!down || !up) {
            const typeName = type && type.name ? type.name : '<unknown>';
            throw new Error(
                `No serializer found for type: "${typeName}". ` +
                'Hints: Use serializable type or provide a custom serializer. ' +
                'Specify property type explicitly, (details: https://github.com/Microsoft/TypeScript/issues/18995)'
            );
        }

        return { down, up, type };

    }

}

export default TypeSerializer;
