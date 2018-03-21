
/** Reporesents a generic property serializer */
interface PropertySerializer<TSerialized, TOriginal> {

    /** Serializes target property in `serializable` and writes value to `serialized` */
    down(serializable: TOriginal, serialized: TSerialized): void;

    /** Deserializes target property from `serialized` and writes value to `serializable` */
    up(serializable: TOriginal, serialized: TSerialized): void;

    /**
     * Assigns target property in `destination` to corresponding property value from `source`. Mutates `destination`.
     * @param destination Destination object. Should be an instance if a serializable class.
     * @param source Source object. May be non-serializable, just a plain object.
     * @returns Destination object
     */
    assign(destination: TOriginal, source: TOriginal): TOriginal;

}

/** Contains property serializer implementations */
namespace PropertySerializer {

    /** Represents a dummy property serializer which does nothing */
    export class Dummy implements PropertySerializer<any, any> {

        public down(serializable: any, serialized: any) { /* do nothing */ }

        public up(serializable: any, serialized: any) { /* do nothing */ }

        public assign(destination: any, source: any) { return destination; }

    }

}

export default PropertySerializer;
