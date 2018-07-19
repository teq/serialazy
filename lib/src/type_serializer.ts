import MetadataManager from './metadata/metadata_manager';
import Constructor from './types/constructor';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Serializer function
     * @param original Original value
     * @returns Serialized value
     */
    down?(this: void, original: TOriginal): TSerialized;

    /**
     * Deserializer function
     * @param serialized Serialized value
     * @returns Original value
     */
    up?(this: void, serialized: TSerialized): TOriginal;

    /**
     * _Optional._ Original type constructor function.
     * Default: Value of `design:type` metadata for given property.
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    /** A helper class which picks a type serializer for given value or type */
    export class Picker<TSerialized> {

        public constructor(
            /** Serialization backend name ('json', 'mongodb', etc.) */
            private backend: string,
        ) {}

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

    /** Compile type serializer partials to a final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<TypeSerializer<TSerialized, TOriginal>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const hints = (
            'Hints: Use a serializable type or provide a custom serializer. ' +
            'Specify property type explicitly, (details: https://github.com/Microsoft/TypeScript/issues/18995)'
        );

        const { down, up, type } = Object.assign({
            down: () => { throw new Error(`Serializer function ("down") for type "${typeName}" is not defined. ` + hints); },
            up: () => { throw new Error(`Deserializer function ("up") for type "${typeName}" is not defined. ` + hints); },
            type: null
        }, ...partials) as TypeSerializer<TSerialized, TOriginal>;

        const typeName = type && type.name ? type.name : '<unknown>';

        return { down, up, type };

    }

}

export default TypeSerializer;
