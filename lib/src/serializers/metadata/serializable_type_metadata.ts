import Constructable from '../../types/constructable';
import TypeSerializer from '../type_serializer';
import { METADATA_VERSION } from './';

/** Abstract metadata container for serializables */
abstract class SerializableTypeMetadata {

    /** Serializable type */
    public abstract readonly type: SerializableTypeMetadata.Type;

    /** Type constructor */
    public readonly ctor: Constructable.Default<any>;

    /** Type name */
    public readonly name: string;

    public version = METADATA_VERSION;

    protected constructor(
        protected proto: Object
    ) { // constructable via `getOrCreateFor`
        this.ctor = proto.constructor as Constructable.Default<any>;
        this.name = this.ctor.name;
    }

    /** Get type serializer based on metadata */
    public abstract getTypeSerializer(): TypeSerializer<any, any>;

}

namespace SerializableTypeMetadata {

    /** Metadata type */
    export enum Type {
        /** Metadata for a custom serializable type */
        CUSTOM = 'custom',
        /** Metadata for a property bag */
        PROP_BAG = 'bag'
    }

}

export default SerializableTypeMetadata;
