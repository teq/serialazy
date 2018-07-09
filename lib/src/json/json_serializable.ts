import JsonType from '../json/json_type';
import MetadataManager from '../metadata/metadata_manager';
import ObjectPropertySerializer from '../object_property_serializer';
import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonTypeSerializer from './json_type_serializer';

function isTypeSerializer<TSerialized, TOriginal>(target: any): target is TypeSerializer<TSerialized, TOriginal> {
    return typeof target === 'object' && typeof target.down === 'function' && typeof target.up === 'function';
}

namespace JsonSerializable {

    /** Use default JSON type serializer for given property */
    export function Prop(
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    /** Use custom JSON type serializer for given property */
    export function Prop<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    export function Prop<TSerialized extends JsonType, TOriginal>(
        optionsOrCustomTypeSerializer: ObjectPropertySerializer.Options | TypeSerializer<TSerialized, TOriginal>,
        maybeOptions?: ObjectPropertySerializer.Options
    ) {

        let customTypeSerializer: TypeSerializer<TSerialized, TOriginal> = null;
        let options: ObjectPropertySerializer.Options = null;

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

            const propertySerializer = new ObjectPropertySerializer(propertyName, compiledTypeSerializerProvider, options);
            MetadataManager.get().getOrCreatePropertyBagMetaFor(proto).setPropertySerializer(propertyName, propertySerializer);

        };

    }

    /** Use custom JSON serializer for given type */
    export function Type<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ) {
        return (ctor: Constructor<TOriginal>) => {
            const customTypeSerializerProvider = () => customTypeSerializer;
            const proto = ctor.prototype;
            MetadataManager.get().getOrCreateCustomTypeMetaFor(proto).setTypeSerializer(customTypeSerializerProvider);
        };
    }

}

export default JsonSerializable;
