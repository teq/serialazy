import JsonPropertySerializer from '../serializers/json/json_property_serializer';
import JsonTypeSerializer from '../serializers/json/json_type_serializer';
import CustomTypeMetadata from '../serializers/metadata/custom_type_metadata';
import PropertyBagMetadata from '../serializers/metadata/property_bag_metadata';
import TypeSerializer from '../serializers/type_serializer';
import Constructor from '../types/constructor';
import JsonType from '../types/json_type';

function isTypeSerializer<TSerialized, TOriginal>(target: any): target is TypeSerializer<TSerialized, TOriginal> {
    return typeof target === 'object' && typeof target.down === 'function' && typeof target.up === 'function';
}

/** Mark property for serialization with default serializer */
function Serialize(
    options?: JsonPropertySerializer.Options
): (proto: Object, propertyName: string) => void;

/** Mark property for serialization with custom serializer */
function Serialize<TSerialized extends JsonType, TOriginal>(
    customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    options?: JsonPropertySerializer.Options
): (proto: Object, propertyName: string) => void;

function Serialize<TSerialized extends JsonType, TOriginal>(
    optionsOrCustomTypeSerializer: JsonPropertySerializer.Options | TypeSerializer<TSerialized, TOriginal>,
    maybeOptions?: JsonPropertySerializer.Options
) {

    let customTypeSerializer: TypeSerializer<TSerialized, TOriginal> = null;
    let options: JsonPropertySerializer.Options = null;

    if (isTypeSerializer(optionsOrCustomTypeSerializer)) {
        customTypeSerializer = optionsOrCustomTypeSerializer;
        options = maybeOptions;
    } else {
        options = optionsOrCustomTypeSerializer;
    }

    return (proto: Object, propertyName: string) => {

        const compiledTypeSerializerProvider = () => {

            try {

                const defaultTypeSerializer = JsonTypeSerializer.pickForProp(proto, propertyName);

                if (customTypeSerializer) {
                    return TypeSerializer.compile([defaultTypeSerializer, customTypeSerializer]);
                } else {
                    return TypeSerializer.compile([defaultTypeSerializer]);
                }

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

    /** Decorator used to define a custom serializer for a given type. */
    export function Type<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ) {
        return (ctor: Constructor<TOriginal>) => {
            const customTypeSerializerProvider = () => customTypeSerializer;
            const proto = ctor.prototype;
            CustomTypeMetadata.getOrCreateFor(proto).setTypeSerializer(customTypeSerializerProvider);
        };
    }

}

export default Serialize;
