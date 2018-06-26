import MetadataManager from './metadata/metadata_manager';
import SerializationBackend from './serialization_backend';
import Constructor from './types/constructor';

/** Represents a generic type serializer */
interface TypeSerializer<TSerialized, TOriginal> {

    /**
     * Property value serializer
     * @param original Original property value
     * @returns Serialized property value
     */
    down(original: TOriginal): TSerialized;

    /**
     * Property value deserializer
     * @param serialized Serialized property value
     * @returns Original property value
     */
    up(serialized: TSerialized): TOriginal;

    /**
     * _Optional._ Original type constructor function.
     * Default: Value of `design:type` metadata for given property.
     */
    type?: Constructor<TOriginal>;

}

namespace TypeSerializer {

    /** Represents a predefined type serializer (has matching methods) */
    export interface Predefined<TSerialized, TOriginal> extends TypeSerializer<TSerialized, TOriginal> {

        /** Check if type serializer matches given value */
        matchValue(value: any): boolean;

        /** Check if type serializer matches given type */
        matchType(type: Constructor<any>): boolean;

    }

    /** A helper class which picks a type serializer for given type/value */
    export class Picker<TSerialized> {

        public constructor(
            private backend: SerializationBackend<TSerialized>
        ) {}

        /** Try to pick a (possibly partial) type serializer for given value */
        public pickForValue(value: any): Partial<TypeSerializer<TSerialized, any>> {

            let serializer: Partial<TypeSerializer<TSerialized, any>> = {};

            if (value === null || value === undefined) {
                throw new Error('Expecting value to be not null/undefined');
            } else if (!(serializer = this.backend.predefinedSerializers.find(s => s.matchValue(value)))) {
                const type = value.constructor;
                if (typeof(type) !== 'function') {
                    throw new Error(`Expecting value to have a constructor function`);
                }
                const proto = Object.getPrototypeOf(value);
                const meta = MetadataManager.get(this.backend.name).getOwnOrInheritedMetaFor(proto);
                if (meta) {
                    serializer = meta.getTypeSerializer();
                } else { // unable to pick a type serializer
                    serializer = { type };
                }
            }

            return serializer;

        }

        /** Try to pick a (possibly partial) type serializer for given type */
        public pickForType(type: Constructor<any>): Partial<TypeSerializer<TSerialized, any>> {

            let serializer: Partial<TypeSerializer<TSerialized, any>> = {};

            if (typeof(type) !== 'function') {
                throw new Error('Expecting a type constructor function');
            } else if (!(serializer = this.backend.predefinedSerializers.find(s => s.matchType(type)))) {
                const meta = MetadataManager.get(this.backend.name).getOwnOrInheritedMetaFor(type.prototype);
                if (meta) {
                    serializer = meta.getTypeSerializer();
                } else { // unable to pick a type serializer
                    serializer = { type };
                }
            }

            return serializer;

        }

        /** Try to pick a (possibly partial) type serializer for given property */
        public pickForProp(proto: Object, propertyName: string): Partial<TypeSerializer<TSerialized, any>> {

            const type: Constructor<any> = Reflect.getMetadata('design:type', proto, propertyName);

            if (type === undefined) {
                throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
            }

            return this.pickForType(type);

        }

    }

    /** Compile type serializer partials to a final type serializer */
    export function compile<TSerialized, TOriginal>(
        partials: Array<Partial<TypeSerializer<TSerialized, TOriginal>>>
    ): TypeSerializer<TSerialized, TOriginal> {

        const hints = (
            'Hints: Use serializable type or provide a custom serializer. ' +
            'Specify property type explicitly, (details: https://github.com/Microsoft/TypeScript/issues/18995)'
        );

        const { down, up, type } = partials.reduce((compiled, partial) => {

            const typeName = partial.type && partial.type.name ? partial.type.name : '<unknown>';

            return Object.assign(compiled, {
                down: (original: TOriginal) => partial.down ? partial.down(original) : (() => {
                    throw new Error(`Serializer function ("down") for type "${typeName}" is not defined. ` + hints);
                })(),
                up: (serialized: TSerialized) => partial.up ? partial.up(serialized) : (() => {
                    throw new Error(`Deserializer function ("up") for type "${typeName}" is not defined. ` + hints);
                })(),
                type: partial.type
            });

        }, {});

        return { down, up, type };

    }

}

export default TypeSerializer;
