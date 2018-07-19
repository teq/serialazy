import MetadataManager from "./metadata/metadata_manager";
import ObjectPropertySerializer from "./object_property_serializer";
import TypeSerializer from "./type_serializer";
import Constructor from "./types/constructor";

function isTypeSerializer<TSerialized, TOriginal>(target: any): target is TypeSerializer<TSerialized, TOriginal> {
    return typeof target === 'object' && (typeof target.down === 'function' || typeof target.up === 'function');
}

/** Implements decorators for serializables which serialize to object-like (property bag) structures */
export default class ObjectSerializable<TSerialized> {

    private picker: TypeSerializer.Picker<TSerialized>;

    public constructor(
        private backend: string
    ) {
        this.picker = new TypeSerializer.Picker<TSerialized>(backend);
    }

    public propertyDecorator(
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    public propertyDecorator<TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    public propertyDecorator<TOriginal>(
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

                    const defaultTypeSerializer = this.picker.pickForProp(proto, propertyName);

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
            MetadataManager.get(this.backend).getOrCreatePropertyBagMetaFor(proto).setPropertySerializer(propertyName, propertySerializer);

        };

    }

    public typeDecorator<TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ) {
        return (ctor: Constructor<TOriginal>) => {
            const customTypeSerializerProvider = () => customTypeSerializer;
            const proto = ctor.prototype;
            MetadataManager.get(this.backend).getOrCreateCustomTypeMetaFor(proto).setTypeSerializer(customTypeSerializerProvider);
        };
    }

}
