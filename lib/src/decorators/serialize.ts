import JsonPropertySerializer from '../serializers/json/json_property_serializer';
import JsonTypeSerializer from '../serializers/json/json_type_serializer';
import Metadata from '../serializers/metadata';
import TypeSerializer from '../serializers/type_serializer';
import Constructable from '../types/constructable';
import JsonType from '../types/json_type';
import Provider from '../types/provider';

/** Decorator used to mark property for serialization with default serializer */
function Serialize(
    options?: JsonPropertySerializer.Options
) {
    return (proto: Object, propertyName: string) => {
        const typeSerializerProvider = () => TypeSerializer.combine([JsonTypeSerializer.pickFor(proto, propertyName)]);
        const propertySerializer = new JsonPropertySerializer(propertyName, typeSerializerProvider, options);
        Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark **instance** member for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
        options?: JsonPropertySerializer.Options
    ) {
        return (proto: Object, propertyName: string) => {
            const defaultTypeSerializerProvider = () => JsonTypeSerializer.pickFor(proto, propertyName);
            const customTypeSerializerProvider = typeof(customTypeSerializer) === 'function' ? customTypeSerializer : () => customTypeSerializer;
            const combinedTypeSerializerProvider = () => {
                try {
                    return TypeSerializer.combine([defaultTypeSerializerProvider(), customTypeSerializerProvider()]);
                } catch (error) {
                    const className = proto.constructor.name;
                    throw new Error(`Unable to construct a type serializer for "${className}.${propertyName}": ${error.message}`);
                }
            };
            const propertySerializer = new JsonPropertySerializer(propertyName, combinedTypeSerializerProvider, options);
            Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
        };
    }

    /** Decorator used to define a custom serializer for a given type. */
    export function Type<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
    ) {
        return (ctor: Constructable.Default<TOriginal>) => {
            return ctor;
        };
    }

}

export default Serialize;
