import { ProjectionOptions } from '../options';
import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';

/** Generic metadata container for serializables */
export default abstract class GenericMetadata {

    /** Type constructor */
    public readonly ctor: Constructor<any>;

    /** Type name */
    public readonly name: string;

    public constructor(
        public readonly backend: string,
        public readonly projection: string,
        public readonly proto: Object,
        public readonly version: number
    ) {
        this.ctor = proto.constructor as Constructor<any>;
        this.name = this.ctor.name;
    }

    /** Get type serializer from metadata */
    public abstract getTypeSerializer(options?: ProjectionOptions): TypeSerializer<any, any>;

}
