import { DeflateOptions, InflateOptions } from './frontend_options';
import MetadataManager from './metadata/metadata_manager';
import TypeSerializer from './type_serializer';
import Constructor from './types/constructor';

/**
 * A helper class which picks a type serializer for given value or type
 * and performs serialization/deserialization
 */
export default class TypeSerializerPicker<TSerialized> {

    public constructor(
        /** Serialization backend name ('json', 'mongodb', etc.) */
        private backend: string,
    ) {}

    /** Serialize given value */
    public deflate<TOriginal>(
        serializable: TOriginal,
        options: DeflateOptions<TSerialized, TOriginal> = {}
    ): TSerialized {

        const { as: ctor } = options;

        let serialized: TSerialized;

        if (serializable === null || serializable === undefined) {
            serialized = serializable as null | undefined;
        } else {
            const { down } = typeof(ctor) === 'function' ? this.pickForType(ctor) : this.pickForValue(serializable);
            if (!down) {
                throw new Error(`Unable to serialize a value: ${serializable}`);
            }
            serialized = down(serializable);
        }

        return serialized;

    }

    /** Construct/deserialize given value */
    public inflate<TOriginal>(
        ctor: Constructor<TOriginal>,
        serialized: TSerialized,
        options: InflateOptions<TSerialized, TOriginal> = {}
    ): TOriginal {

        if (typeof(ctor) !== 'function') {
            throw new Error('Expecting a constructor function');
        }

        const { up } = this.pickForType(ctor);

        if (!up) {
            throw new Error(`Unable to deserialize an instance of "${ctor.name}" from: ${serialized}`);
        }

        return up(serialized);

    }

    /** Try to pick a (possibly partial) type serializer for given value */
    public pickForValue(value: any): TypeSerializer<TSerialized, any> {

        if (value === null || value === undefined) {
            throw new Error('Expecting value to be not null/undefined');
        }

        const type = value.constructor;

        if (typeof(type) !== 'function') {
            throw new Error(`Expecting value to have a constructor function`);
        }

        const proto = Object.getPrototypeOf(value);
        const meta = MetadataManager.get(this.backend).getOwnOrInheritedMetaFor(proto);

        return meta ? meta.getTypeSerializer() : { type };

    }

    /** Try to pick a (possibly partial) type serializer for given type */
    public pickForType(type: Constructor<any>): TypeSerializer<TSerialized, any> {

        if (typeof(type) !== 'function') {
            throw new Error('Expecting a type constructor function');
        }

        const meta = MetadataManager.get(this.backend).getOwnOrInheritedMetaFor(type.prototype);

        return meta ? meta.getTypeSerializer() : { type };

    }

    /** Try to pick a (possibly partial) type serializer for given property */
    public pickForProp(proto: Object, propertyName: string): TypeSerializer<TSerialized, any> {

        const type: Constructor<any> = Reflect.getMetadata('design:type', proto, propertyName);

        if (type === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        return this.pickForType(type);

    }

}
