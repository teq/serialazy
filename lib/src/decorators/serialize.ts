import Metadata from '../serializers/metadata';
import Serializer from '../serializers/serializer';
import SerializerFactory from '../serializers/serializer_factory';
import JsonType from '../types/json_type';

const defaultOptions: Serializer.Options = {
    optional: false,
    nullable: false
};

/** Decorator used to mark function for serialization with default serializer */
function Serialize(options?: Serializer.Options) {
    return (target: Object, propertyName: string) => {
        const mergedOptions = options ? { ...defaultOptions, ...options } : defaultOptions;
        const serializer = SerializerFactory.createFor(target, propertyName, mergedOptions);
        Metadata.getOrCreateFor(target).props.set(propertyName, serializer);
    };
}

namespace Serialize {

    /** Decorator used to mark function for serialization with custom serializer */
    export function Custom<TSerialized extends JsonType, TOriginal = any>(serializer: Serializer<TSerialized, TOriginal>) {
        return (target: Object, propertyName: string, propertyDescriptor?: TypedPropertyDescriptor<TOriginal>) => {
            Metadata.getOrCreateFor(target).props.set(propertyName, serializer);
        };
    }

}

export default Serialize;
