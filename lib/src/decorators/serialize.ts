import Metadata from '../serializers/metadata';
import PropertySerializer from '../serializers/property_serializer';
import TypeSerializer from '../serializers/type_serializer';
import JsonType from '../types/json_type';

/** Decorator used to mark function for serialization with default serializer */
function Serialize(options?: PropertySerializer.Options) {
    return (target: Object, propertyName: string) => {
        const typeSerializer = TypeSerializer.createFor(target, propertyName);
        const propertySerializer = new PropertySerializer(propertyName, typeSerializer, options);
        Metadata.getOrCreateFor(target).serializers.push(propertySerializer);
    };
}

namespace Serialize {

    /** Decorator used to mark function for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(
        serializer: TypeSerializer<TSerialized, TOriginal>,
        options?: PropertySerializer.Options
    ) {
        return (target: Object, propertyName: string, propertyDescriptor?: TypedPropertyDescriptor<TOriginal>) => {
            const propertySerializer = new PropertySerializer(propertyName, serializer, options);
            Metadata.getOrCreateFor(target).serializers.push(propertySerializer);
        };
    }

}

export default Serialize;
