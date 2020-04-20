import { DEFAULT_PROJECTION, MetadataManager } from "./metadata";
import ObjectPropertySerializer from "./object_property_serializer";
import { DecoratorOptions } from "./options";
import { Constructor, isConstructor } from "./types/constructor";
import TypeSerializer from "./type_serializer";

/** Constructs type/property decorators */
export default function DecoratorFactory<TSerialized, TOriginal>(
    backend: string,
    options?: DecoratorOptions<TSerialized, TOriginal>
) {

    let { projection } = options || {};
    projection = projection || DEFAULT_PROJECTION;

    function decorateProperty(proto: Object, propertyName: string, options: DecoratorOptions<TSerialized, TOriginal>) {

        const propertySerializer = ObjectPropertySerializer(backend).create(proto, propertyName, options);

        MetadataManager.get(backend, projection)
            .getOrCreateMetaFor(proto)
            .addOwnPropertySerializer(propertySerializer);

    }

    function decorateType(ctor: Constructor<TOriginal>, options: DecoratorOptions<TSerialized, TOriginal>) {

        const customTypeSerializerProvider = () => {
            return { type: ctor, ...options } as TypeSerializer<TSerialized, TOriginal>;
        };

        const proto = ctor.prototype;

        MetadataManager.get(backend, projection)
            .getOrCreateMetaFor(proto)
            .setOwnTypeSerializer(customTypeSerializerProvider);

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
