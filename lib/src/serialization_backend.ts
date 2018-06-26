import TypeSerializer from './type_serializer';

/** Represents a serialization backend */
export default interface SerializationBackend<TSerialized> {

    /** Backend name */
    name: string;

    /** Contains predefined serializers for given backend */
    predefinedSerializers: Array<TypeSerializer.Predefined<TSerialized, any>>;

}
