import { SerializeDecoratorOptions } from "./frontend_options";
import MetadataManager from "./metadata/metadata_manager";
import ObjectPropertySerializer from "./object_property_serializer";
import TypeSerializer from "./type_serializer";
import TypeSerializerPicker from './type_serializer_picker';
import Constructor from "./types/constructor";

function isConstructor(protoOrCtor: Object | Constructor<unknown>): protoOrCtor is Constructor<unknown> {
    return typeof protoOrCtor === 'function';
}

function isTypeSerializer<TSerialized, TOriginal>(target: any): target is TypeSerializer<TSerialized, TOriginal> {
    return typeof target === 'object' && (typeof target.down === 'function' || typeof target.up === 'function');
}

/** Creates type/property decorators */
export default class DecoratorFactory<TSerialized> {

    private picker: TypeSerializerPicker<TSerialized>;

    public constructor(
        private backend: string
    ) {
        this.picker = new TypeSerializerPicker<TSerialized>(backend);
    }

    /** Create new type/property decorator */
    public create<TOriginal>(
        options?: SerializeDecoratorOptions<TSerialized, TOriginal>
    ) {
        return (protoOrCtor: Object | Constructor<TOriginal>, propertyName?: string) => {
            if (isConstructor(protoOrCtor)) {
                this.decorateType(protoOrCtor, options);
            } else if (typeof protoOrCtor === 'object' && typeof propertyName === 'string') {
                this.decorateProperty(protoOrCtor, propertyName, options);
            } else {
                throw new Error('Unable to decorate: Target is not a property, nor a constructor');
            }
        };
    }

    private decorateProperty<TOriginal>(
        proto: Object,
        propertyName: string,
        params?: SerializeDecoratorOptions<TSerialized, TOriginal>
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

    private decorateType<TOriginal>(
        ctor: Constructor<TOriginal>,
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ) {
        const customTypeSerializerProvider = () => customTypeSerializer;
        const proto = ctor.prototype;
        MetadataManager.get(this.backend).getOrCreateCustomTypeMetaFor(proto).setTypeSerializer(customTypeSerializerProvider);
    }

}
