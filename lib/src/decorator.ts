import MetadataManager from "./metadata/metadata_manager";
import ObjectPropertySerializer from "./object_property_serializer";
import TypeSerializer from "./type_serializer";
import Constructor from "./types/constructor";

function isTypeSerializer<TSerialized, TOriginal>(target: any): target is TypeSerializer<TSerialized, TOriginal> {
    return typeof target === 'object' && (typeof target.down === 'function' || typeof target.up === 'function');
}

/** Decorates types and properties with serializer */
export default class Decorator<TSerialized> {

    private picker: TypeSerializer.Picker<TSerialized>;

    public constructor(
        private backend: string
    ) {
        this.picker = new TypeSerializer.Picker<TSerialized>(backend);
    }

    public decorateProperty<TOriginal>(
        proto: Object,
        propertyName: string,
        params?: TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options
    ) {

        let customTypeSerializer: TypeSerializer<TSerialized, TOriginal> = null;
        let options: ObjectPropertySerializer.Options = null;

        if (isTypeSerializer(params)) {
            customTypeSerializer = params;
            options = params;
        } else {
            options = params;
        }

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
                throw new Error(`Unable to construct a type serializer for "${propertyName}" property of "${className}": ${error.message}`);
            }

        };

        const propertySerializer = new ObjectPropertySerializer(propertyName, compiledTypeSerializerProvider, options);
        MetadataManager.get(this.backend).getOrCreatePropertyBagMetaFor(proto).setPropertySerializer(propertyName, propertySerializer);

    }

    public decorateType<TOriginal>(
        ctor: Constructor<TOriginal>,
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ) {
        const customTypeSerializerProvider = () => customTypeSerializer;
        const proto = ctor.prototype;
        MetadataManager.get(this.backend).getOrCreateCustomTypeMetaFor(proto).setTypeSerializer(customTypeSerializerProvider);
    }

}
