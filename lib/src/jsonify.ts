import 'reflect-metadata';

import Constructable from './constructable';
import SerializationError from './errors/serialization_error';
import { JsonMap } from './json_type';
import Metadata from './metadata';

namespace Jsonify {

    /**
     * Serialize to JSON-compatible object
     * @param serializable Serializable object
     * @returns JSON-compatible object which can be safely passed to `JSON.serialize`
     */
    export function toJsonObject(serializable: any): JsonMap {

        let jsonObj: JsonMap;

        if (serializable === null || serializable === undefined) {

            jsonObj = serializable;

        } else {

            const proto = Object.getPrototypeOf(serializable) || {};

            const meta = Metadata.expectFor(proto);

            jsonObj = {};

            meta.props.forEach((serializer, name) => {
                const value = serializer.down(serializable[name]);
                if (value !== undefined) {
                    jsonObj[name] = value;
                }
            });

        }

        return jsonObj;
    }

    /**
     * Construct class instance from JSON-compatible object
     * @param ctor Class instance constructor
     * @param jsonObj JSON-compatible object (e.g. returned from `JSON.parse`)
     * @returns Serializable class instance
     */
    export function fromJsonObject<T>(ctor: Constructable<T>, jsonObj: JsonMap): T {

        let classInstance: T;

        if (jsonObj === null || jsonObj === undefined) {

            classInstance = jsonObj as any;

        } else {

            if (!ctor || !ctor.prototype) {
                throw new SerializationError('Expecting a valid constructor function');
            }

            const meta = Metadata.expectFor(ctor.prototype);

            classInstance = new ctor();

            meta.props.forEach((serializer, name) => {
                const value = serializer.up(jsonObj[name]);
                if (value !== undefined) {
                    (classInstance as any)[name] = value;
                }
            });

        }

        return classInstance;
    }

}

export default Jsonify;
export { default as Serialize} from './serialize';
export { default as Serializable} from './serializable';
export { default as SerializationError} from './errors/serialization_error';
