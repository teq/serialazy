import { DEFAULT_PROJECTION, MetadataManager } from './metadata';
import TypeSerializer from './type_serializer';
import { Constructor, isConstructor } from './types/constructor';

/** Returns a helper which picks a type serializer for given value or type */
export default function TypeSerializerPicker<TSerialized>(backend: string, projection?: string) {

    projection = projection || DEFAULT_PROJECTION;

    /** Try to pick a (possibly partial) type serializer for given type */
    function pickForType(ctor: Constructor<unknown>): TypeSerializer<TSerialized, any> {

        if (!isConstructor(ctor)) {
            throw new Error('Expecting constructor function');
        }

        const proto = ctor.prototype as Object;
        let meta = MetadataManager.get(backend, projection).getMetaFor(proto);

        if (meta) {
            return meta.getTypeSerializer();
        } else if (projection !== DEFAULT_PROJECTION) {
            // Try to fall back to default projection
            meta = MetadataManager.get(backend, DEFAULT_PROJECTION).getMetaFor(proto);
            if (meta) {
                return meta.getTypeSerializer();
            }
        }

        return { type: ctor };

    }

    /** Try to pick a (possibly partial) type serializer for given property */
    function pickForProp(proto: Object, propertyName: string): TypeSerializer<TSerialized, any> {

        const ctor: Constructor<unknown> = Reflect.getMetadata('design:type', proto, propertyName);

        if (ctor === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        return pickForType(ctor);

    }

    /** Try to pick a (possibly partial) type serializer for given value */
    function pickForValue(value: unknown): TypeSerializer<TSerialized, any> {

        if (value === null || value === undefined) {
            throw new Error('Expecting value to be not null/undefined');
        }

        return pickForType(value.constructor as Constructor<unknown>);

    }

    return {
        pickForType,
        pickForProp,
        pickForValue
    };

}
