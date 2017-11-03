
/** Respresents a serialization error */
class SerializationError extends Error {

    public constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }

}

export default SerializationError;
