import Constructable from '../types/constructable';
import JsonTypeSerializer from './json/json_type_serializer';

/** Represents a type serializer */
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
     * _Optional._ Property type constructor function.
     * Default: Value of `design:type` for given property.
     */
    type?: Constructable.Default<TOriginal>;

    /**
     * _Optional._ Property type descriminator function.
     * Used to narrow type constructor function (e.g. for union types)
     * @param value Property value
     * @returns Property type constructor function
     */
    discriminate?(this: void, value: TOriginal): Constructable.Default<TOriginal>;

}

namespace TypeSerializer {

    /** Try to pick a (possibly partial) type serializer for given property */
    export function partialFor(proto: Object, propertyName: string): Partial<JsonTypeSerializer<any>> {
        return JsonTypeSerializer.partialFor(proto, propertyName);
    }

    /** Combine type serializer partials to final type serializer */
    export function combine<TSerialized, TOriginal>(
        partials: Array<Partial<TypeSerializer<TSerialized, TOriginal>>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const { down, up, type, discriminate } = partials.reduce((combined, partial) => ({ ...combined, ...partial }), {});

        if (!down || !up) {
            const typeName = type && type.name ? type.name : '<unknown>';
            throw new Error(
                `No serializer for type "${typeName}". ` +
                'Hint: Use serializable type or provide a custom serializer. ' +
                'Try to specify property type explicitely, default serializer may be failing to pick it because of: ' +
                'https://github.com/Microsoft/TypeScript/issues/18995. '
            );
        }

        return { down, up, type, discriminate };

    }

}

export default TypeSerializer;
