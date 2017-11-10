import Metadata from '../serializers/metadata';
import PropertySerializer from '../serializers/property_serializer';
import TypeSerializer from '../serializers/type_serializer';
import JsonType from '../types/json_type';

/** Decorator used to mark property for serialization with default serializer */
function Serialize(options?: PropertySerializer.Configurable.Options) {
    return (target: Object, propertyName: string) => {
        const typeSerializer = TypeSerializer.createFor(target, propertyName);
        const propertySerializer = new PropertySerializer.Configurable(propertyName, typeSerializer, options);
        Metadata.getOrCreateFor(target).ownSerializers.set(propertyName, propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark property for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(
        serializer: TypeSerializer<TSerialized, TOriginal>,
        options?: PropertySerializer.Configurable.Options
    ) {
        return (target: Object, propertyName: string, propertyDescriptor?: TypedPropertyDescriptor<TOriginal>) => {
            const propertySerializer = new PropertySerializer.Configurable(propertyName, serializer, options);
            Metadata.getOrCreateFor(target).ownSerializers.set(propertyName, propertySerializer);
        };
    }

    /** Decorator used to explicitely mark property as non-serializable. Can be used to erase inherited serializer. */
    export function Skip() {
        return (target: Object, propertyName: string) => {
            const propertySerializer = new PropertySerializer.Dummy();
            Metadata.getOrCreateFor(target).ownSerializers.set(propertyName, propertySerializer);
        };
    }

}

export default Serialize;
