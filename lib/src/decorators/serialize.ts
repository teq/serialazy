import Metadata from '../serializers/metadata';
import PropertySerializer from '../serializers/property_serializer';
import TypeSerializer from '../serializers/type_serializer';
import JsonType from '../types/json_type';
import Provider from '../types/provider';

/** Decorator used to mark property for serialization with default serializer */
function Serialize(options?: PropertySerializer.Configurable.Options) {
    return (proto: Object, propertyName: string) => {
        const typeSerializerProvider = TypeSerializer.getProviderFor(proto, propertyName);
        const propertySerializer = new PropertySerializer.Configurable(propertyName, typeSerializerProvider, options);
        Metadata.getOrCreateFor(proto).ownSerializers.set(propertyName, propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark property for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(
        serializerOrProvider: TypeSerializer<TSerialized, TOriginal> | Provider<TypeSerializer<TSerialized, TOriginal>>,
        options?: PropertySerializer.Configurable.Options
    ) {
        return (proto: Object, propertyName: string, propertyDescriptor?: TypedPropertyDescriptor<TOriginal>) => {
            const typeSerializerProvider = typeof(serializerOrProvider) === 'function' ? serializerOrProvider : () => serializerOrProvider;
            const propertySerializer = new PropertySerializer.Configurable(propertyName, typeSerializerProvider, options);
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
