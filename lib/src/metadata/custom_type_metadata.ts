import TypeSerializer from '../type_serializer';
import Provider from '../types/provider';
import SerializableTypeMetadata from './serializable_type_metadata';

/** Metadata container for custom serializable types */
export default class CustomTypeMetadata extends SerializableTypeMetadata {

    private typeSerializerProvider: Provider<TypeSerializer<any, any>> = null;

    /** Get type serializer from a custom type metadata */
    public getTypeSerializer() {

        if (!this.typeSerializerProvider) {
            throw new Error('Type serializer is not specified');
        }

        return this.typeSerializerProvider();

    }

    /** Set type serializer on a custom type metadata */
    public setTypeSerializer(typeSerializer: TypeSerializer<any, any> | Provider<TypeSerializer<any, any>>) {
        this.typeSerializerProvider = typeof(typeSerializer) === 'function' ? typeSerializer : () => typeSerializer;
    }

}
