
/** Generic property serializer */
interface Serializer<TSerialized, TOriginal> {
    /** Serializer */
    down: (value: TOriginal) => TSerialized;
    /** Deserializer */
    up: (value: TSerialized) => TOriginal;
}

namespace Serializer {

    export interface Options {
        /** Indicates if property can be undefined. Default: false */
        optional?: boolean;
        /** Indicates if property can be null. Default: false */
        nullable?: boolean;
    }

}

export default Serializer;
