import { DecoratorOptions } from "./frontend_options";
import { DEFAULT_PROJECTION, MetadataManager } from "./metadata";
import ObjectPropertySerializer from "./object_property_serializer";
import TypeSerializer from "./type_serializer";
import TypeSerializerPicker from './type_serializer_picker';
import { Constructor, isConstructor } from "./types/constructor";

/** Constructs type/property decorators */
export default function DecoratorFactory<TSerialized, TOriginal>(
    backend: string,
    options?: DecoratorOptions<TSerialized, TOriginal>
) {

    let { projection } = (options || {}) as DecoratorOptions<TSerialized, TOriginal>;
    projection = projection || DEFAULT_PROJECTION;

    function decorateProperty<TOriginal>(proto: Object, propertyName: string, options: DecoratorOptions<TSerialized, TOriginal>) {

        const picker = TypeSerializerPicker(backend, projection);

        const compiledTypeSerializerProvider = () => {
            try {
                const defaultTypeSerializer = picker.pickForProp(proto, propertyName);
                const customTypeSerializer = options as TypeSerializer<TSerialized, TOriginal>;
                return TypeSerializer.compile([defaultTypeSerializer, customTypeSerializer]);
            } catch (error) {
                const className = proto.constructor.name;
                throw new Error(`Unable to construct a type serializer for "${propertyName}" property of "${className}": ${error.message}`);
            }
        };

        const propertySerializer = ObjectPropertySerializer(propertyName, compiledTypeSerializerProvider, options);

        MetadataManager.get(backend, projection)
            .getOrCreatePropertyBagMetaFor(proto)
            .addPropertySerializer(propertySerializer);

    }

    function decorateType<TOriginal>(ctor: Constructor<TOriginal>, options: DecoratorOptions<TSerialized, TOriginal>) {

        const customTypeSerializerProvider = () => options as TypeSerializer<TSerialized, TOriginal>;

        const proto = ctor.prototype;

        MetadataManager.get(backend, projection)
            .getOrCreateCustomTypeMetaFor(proto)
            .setTypeSerializer(customTypeSerializerProvider);

    }

    return (protoOrCtor: Object | Constructor<TOriginal>, propertyName?: string) => {
        if (isConstructor(protoOrCtor)) {
            decorateType(protoOrCtor, options);
        } else if (typeof protoOrCtor === 'object' && typeof propertyName === 'string') {
            decorateProperty(protoOrCtor, propertyName, options);
        } else {
            throw new Error('Unable to decorate: Target is not a property, nor a constructor');
        }
    };

}
