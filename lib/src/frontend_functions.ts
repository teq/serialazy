import { DeflateOptions, InflateOptions } from './frontend_options';
import { DEFAULT_PROJECTION } from "./metadata";
import TypeSerializerPicker from './type_serializer_picker';
import { Constructor, isConstructor } from './types/constructor';

export default function FrontendFunctions<TSerialized>(backend: string) {

    /** Serialize given value */
    function deflate<TOriginal>(serializable: TOriginal, options?: DeflateOptions<TSerialized, TOriginal>): TSerialized {

        let { as: ctor, projection } = (options || {}) as DeflateOptions<TSerialized, TOriginal>;
        projection = projection || DEFAULT_PROJECTION;

        let serialized: TSerialized;

        if (serializable === null || serializable === undefined) {

            serialized = serializable as null | undefined;

        } else {

            const picker = TypeSerializerPicker<TSerialized>(backend, projection);
            const { down, type } = isConstructor(ctor) ? picker.pickForType(ctor) : picker.pickForValue(serializable);

            if (!down) {
                throw new Error(
                    `Unable to serialize an instance of "${type.name}". ` +
                    'Its serializer is not defined or doesn\'t have a "down" method'
                );
            }

            serialized = down(serializable);
        }

        return serialized;

    }

    /** Construct/deserialize given value */
    function inflate<TOriginal>(ctor: Constructor<TOriginal>, serialized: TSerialized, options?: InflateOptions<TSerialized, TOriginal>): TOriginal {

        let { projection } = (options || {}) as InflateOptions<TSerialized, TOriginal>;
        projection = projection || DEFAULT_PROJECTION;

        if (!isConstructor(ctor)) {
            throw new Error('Expecting a constructor function');
        }

        const picker = TypeSerializerPicker<TSerialized>(backend, projection);
        const { up, type } = picker.pickForType(ctor);

        if (!up) {
            throw new Error(
                `Unable to deserialize an instance of "${type.name}". ` +
                'Its serializer is not defined or doesn\'t have an "up" method'
            );
        }

        return up(serialized);

    }

    return {
        deflate,
        inflate
    };

}
