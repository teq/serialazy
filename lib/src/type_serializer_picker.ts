import { DEFAULT_PROJECTION, MetadataManager } from './metadata';
import { DeflateOrInflateOptions } from './options';
import { Constructor, isConstructor } from './types/constructor';
import TypeSerializer from './type_serializer';

/** Returns a helper which picks a type serializer for given value or type */
export default function TypeSerializerPicker<TSerialized, TOriginal>(
    backend: string,
    options?: DeflateOrInflateOptions<TSerialized, TOriginal>
) {

    let { projection, fallbackToDefaultProjection = true } = options || {};
    projection = projection || DEFAULT_PROJECTION;

    /** Try to pick a (possibly partial) type serializer for given type */
    function pickForType(ctor: Constructor<TOriginal>): TypeSerializer<TSerialized, TOriginal> {

        if (!isConstructor(ctor)) {
            throw new Error('Expecting constructor function');
        }

        const proto = ctor.prototype as Object;

        let meta = MetadataManager.get(backend, projection).getMetaFor(proto);

        if (!meta && projection !== DEFAULT_PROJECTION && (fallbackToDefaultProjection || isBuiltInType(ctor))) {
            meta = MetadataManager.get(backend, DEFAULT_PROJECTION).getMetaFor(proto);
        }

        const typeSerializer = meta?.getTypeSerializer(options);

        return typeSerializer || { type: ctor };

    }

    /** Try to pick a (possibly partial) type serializer for given property */
    function pickForProp(proto: Object, propertyName: string): TypeSerializer<TSerialized, TOriginal> {

        const ctor: Constructor<TOriginal> = Reflect.getMetadata('design:type', proto, propertyName);

        if (ctor === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        return pickForType(ctor);

    }

    /** Try to pick a (possibly partial) type serializer for given value */
    function pickForValue(value: unknown): TypeSerializer<TSerialized, TOriginal> {

        if (value === null || value === undefined) {
            throw new Error('Expecting value to be not null/undefined');
        }

        return pickForType(value.constructor as Constructor<TOriginal>);

    }

    return {
        pickForType,
        pickForProp,
        pickForValue
    };

}

function isBuiltInType(ctor: Constructor<unknown>) {
    return ([Boolean, Number, String] as Array<Constructor<unknown>>).includes(ctor);
}
