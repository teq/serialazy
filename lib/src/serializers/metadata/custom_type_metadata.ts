import Provider from '../../types/provider';
import TypeSerializer from '../type_serializer';
import SerializableTypeMetadata from './serializable_type_metadata';

/** Metadata container for custom serializable types */
export default class CustomTypeMetadata extends SerializableTypeMetadata {

    public readonly type = SerializableTypeMetadata.Type.CUSTOM;

    private typeSerializerProvider: Provider<TypeSerializer<any, any>> = null;

    /** Get type serializer from a custom type metadata */
    public getTypeSerializer() {

        if (!this.typeSerializerProvider) {
            throw new Error('Unable to get a type serializer from custom serializable type metadata');
        }

        return this.typeSerializerProvider();

    }

    /** Set type serializer on a custom type metadata */
    public setTypeSerializer(typeSerializer: TypeSerializer<any, any> | Provider<TypeSerializer<any, any>>) {
        this.typeSerializerProvider = typeof(typeSerializer) === 'function' ? typeSerializer : () => typeSerializer;
    }

    /** Get or create own custom type metadata for given prototype */
    public static getOrCreateFor(proto: Object): CustomTypeMetadata {

        let metadata = this.getFor<CustomTypeMetadata>(proto);

        if (!metadata) {
            const inherited = this.seekForInheritedMetaFor(proto);
            if (inherited) {
                throw new Error('Can\'t define a custom serializer on type which inherits from another serializable');
            }
            metadata = new CustomTypeMetadata(proto);
            this.setFor(proto, metadata);
        } else if (metadata.type !== SerializableTypeMetadata.Type.CUSTOM) {
            throw new Error('Can\'t define a custom serializer on type which has property serializers');
        }

        return metadata;

    }

}
