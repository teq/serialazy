
/** Generic property serializer */
interface Serializer<TSerialized, TOriginal> {
    /** Serialization function */
    down: (value: TOriginal) => TSerialized;
    /** Deserialization function */
    up: (value: TSerialized) => TOriginal;
}

namespace Serializer {

    /** Serializer options */
    export interface Options {
        /** Indicates if property can be undefined. Default: false */
        optional?: boolean;
        /** Indicates if property can be null. Default: false */
        nullable?: boolean;
    }

}

export default Serializer;
