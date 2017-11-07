import Metadata from '../serializers/metadata';
import PropertySerializer from '../serializers/property_serializer';
import Serializer from '../serializers/serializer';
import SerializerFactory from '../serializers/serializer_factory';
import JsonType from '../types/json_type';

/** Decorator used to mark function for serialization with default serializer */
function Serialize(options?: PropertySerializer.Options) {
    return (target: Object, propertyName: string) => {
        const typeSerializer = SerializerFactory.createFor(target, propertyName);
        const propertySerializer = new PropertySerializer(propertyName, typeSerializer, options);
        Metadata.getOrCreateFor(target).serializers.push(propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark function for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(
        serializer: Serializer<TSerialized, TOriginal>,
        options?: PropertySerializer.Options
    ) {
        return (target: Object, propertyName: string, propertyDescriptor?: TypedPropertyDescriptor<TOriginal>) => {
            const propertySerializer = new PropertySerializer(propertyName, serializer, options);
            Metadata.getOrCreateFor(target).serializers.push(propertySerializer);
        };
    }

}

export default Serialize;
