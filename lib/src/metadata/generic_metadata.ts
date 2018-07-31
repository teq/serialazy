import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import MetadataManager from './metadata_manager';

/** Generic metadata container for serializables */
export default abstract class GenericMetadata {

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
