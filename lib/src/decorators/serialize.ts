import JsonPropertySerializer from '../serializers/json/json_property_serializer';
import JsonTypeSerializer from '../serializers/json/json_type_serializer';
import CustomTypeMetadata from '../serializers/metadata/custom_type_metadata';
import PropertyBagMetadata from '../serializers/metadata/property_bag_metadata';
import TypeSerializer from '../serializers/type_serializer';
import Constructor from '../types/constructor';
import JsonType from '../types/json_type';
import Provider from '../types/provider';

/** Decorator used to mark property for serialization with default serializer */
function Serialize(
    options?: JsonPropertySerializer.Options
) {
    return (proto: Object, propertyName: string) => {
        const compiledTypeSerializerProvider = () => {
            try {
                return TypeSerializer.compile([JsonTypeSerializer.pickForProp(proto, propertyName)]);
            } catch (error) {
                const className = proto.constructor.name;
                throw new Error(`Unable to construct a type serializer for property "${className}.${propertyName}": ${error.message}`);
            }
        };
        const propertySerializer = new JsonPropertySerializer(propertyName, compiledTypeSerializerProvider, options);
        PropertyBagMetadata.getOrCreateFor(proto).setPropertySerializer(propertyName, propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark property for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
        options?: JsonPropertySerializer.Options
    ) {
        return (proto: Object, propertyName: string) => {
            const defaultTypeSerializerProvider = () => JsonTypeSerializer.pickForProp(proto, propertyName);
            const customTypeSerializerProvider = typeof(customTypeSerializer) === 'function' ? customTypeSerializer : () => customTypeSerializer;
            const compiledTypeSerializerProvider = () => {
                try {
                    return TypeSerializer.compile([defaultTypeSerializerProvider(), customTypeSerializerProvider()]);
                } catch (error) {
                    const className = proto.constructor.name;
                    throw new Error(`Unable to construct a type serializer for property "${className}.${propertyName}": ${error.message}`);
                }
            };
            const propertySerializer = new JsonPropertySerializer(propertyName, compiledTypeSerializerProvider, options);
            PropertyBagMetadata.getOrCreateFor(proto).setPropertySerializer(propertyName, propertySerializer);
        };
    }

    /** Decorator used to define a custom serializer for a given type. */
    export function Type<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
    ) {
        return (ctor: Constructor.Default<TOriginal>) => {
            const customTypeSerializerProvider = typeof(customTypeSerializer) === 'function' ? customTypeSerializer : () => customTypeSerializer;
            const proto = ctor.prototype;
            CustomTypeMetadata.getOrCreateFor(proto).setTypeSerializer(customTypeSerializerProvider);
        };
    }

}

export default Serialize;
