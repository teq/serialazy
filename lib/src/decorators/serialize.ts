import Metadata from '../serializers/metadata';
import PropertySerializer from '../serializers/property_serializer';
import TypeSerializer from '../serializers/type_serializer';
import JsonType from '../types/json_type';
import Provider from '../types/provider';

/** Decorator used to mark property for serialization with default serializer */
function Serialize(
    options?: PropertySerializer.Configurable.Options
) {
    return (proto: Object, propertyName: string) => {
        const typeSerializerProvider = () => TypeSerializer.combine([TypeSerializer.partialFor(proto, propertyName)]);
        const propertySerializer = new PropertySerializer.Configurable(propertyName, typeSerializerProvider, options);
        Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark property for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
        options?: PropertySerializer.Configurable.Options
    ) {
        return (proto: Object, propertyName: string) => {
            const defaultTypeSerializerProvider = () => TypeSerializer.partialFor(proto, propertyName);
            const customTypeSerializerProvider = typeof(customTypeSerializer) === 'function' ? customTypeSerializer : () => customTypeSerializer;
            const combinedTypeSerializerProvider = () => {
                try {
                    return TypeSerializer.combine([defaultTypeSerializerProvider(), customTypeSerializerProvider()]);
                } catch (error) {
                    const className = proto.constructor.name;
                    throw new Error(`Unable to construct a type serializer for "${className}.${propertyName}": ${error.message}`);
                }
            };
            const propertySerializer = new PropertySerializer.Configurable(propertyName, combinedTypeSerializerProvider, options);
            Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
        };
    }

    /** Decorator used to explicitely mark property as non-serializable. Can be used to erase inherited serializer. */
    export function Skip() {
        return (proto: Object, propertyName: string) => {
            const propertySerializer = new PropertySerializer.Dummy();
            Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
        };
    }

}

export default Serialize;
