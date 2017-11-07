
/** Generic type serializer */
export default interface Serializer<TSerialized, TOriginal> {
    /** Serialization function */
    down: (value: TOriginal) => TSerialized;
    /** Deserialization function */
    up: (value: TSerialized) => TOriginal;
}
