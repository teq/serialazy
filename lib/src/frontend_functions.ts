import { DEFAULT_PROJECTION } from "./metadata";
import { DeflateOptions, InflateOptions } from './options';
import { Constructor, isConstructor } from './types/constructor';
import TypeSerializerPicker from './type_serializer_picker';

export default function FrontendFunctions(backend: string) {

    /** Serialize given value */
    function deflate<TSerialized, TOriginal>(
        serializable: TOriginal,
        options?: DeflateOptions<TSerialized, TOriginal>
    ): TSerialized {

        let { as: ctor, projection } = options || {};
        projection = projection || DEFAULT_PROJECTION;

        if (serializable === null || serializable === undefined) {

            return serializable as null | undefined;

        } else {

            const picker = TypeSerializerPicker<TSerialized, TOriginal>(backend, options);
            const { down, type } = isConstructor(ctor) ? picker.pickForType(ctor) : picker.pickForValue(serializable);

            if (!down) {
                throw new Error(
                    `Unable to serialize an instance of "${type.name}" in projection: "${projection}". ` +
                    'Its serializer is not defined or doesn\'t have a "down" method'
                );
            }

            return down(serializable);
        }

    }

    /** Construct/deserialize given value */
    function inflate<TSerialized, TOriginal>(
        ctor: Constructor<TOriginal>,
        serialized: TSerialized,
        options?: InflateOptions<TSerialized, TOriginal>
    ): TOriginal {

        let { projection } = options || {};
        projection = projection || DEFAULT_PROJECTION;

        if (!isConstructor(ctor)) {
            throw new Error('Expecting a constructor function');
        }

        const picker = TypeSerializerPicker<TSerialized, TOriginal>(backend, options);
        const { up, type } = picker.pickForType(ctor);

        if (!up) {
            throw new Error(
                `Unable to deserialize an instance of "${type.name}" in projection: "${projection}". ` +
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
