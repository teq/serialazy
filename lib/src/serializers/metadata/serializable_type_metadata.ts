import Constructor from '../../types/constructor';
import TypeSerializer from '../type_serializer';
import MetadataManager from './metadata_manager';

/** Abstract metadata container for serializables */
export default abstract class SerializableTypeMetadata {

    /** Type constructor */
    public readonly ctor: Constructor<any>;

    /** Type name */
    public readonly name: string;

    public constructor(

        /** Prototype to create metadata for */
        public readonly proto: Object,

        /** Metadata version */
        public readonly version: number,

        /** Manager instance to access metadata */
        protected readonly manager: MetadataManager,

    ) {
        this.ctor = proto.constructor as Constructor<any>;
        this.name = this.ctor.name;
    }

    /** Get type serializer from metadata */
    public abstract getTypeSerializer(): TypeSerializer<any, any>;

}
