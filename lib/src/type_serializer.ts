import { MetadataManager } from './metadata';
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

    /** Represents a type which can be matched against a value or a type */
    export interface Matchable {

        /** Check if it matches given value */
        matchValue(value: any): boolean;

        /** Check if it matches given type */
        matchType(type: Constructor<any>): boolean;

    }

    /** A helper class to pick a type serializer */
    export class Picker<TSerialized> {

        public constructor(
            private backend: string,
            private predefinedSerializers: Array<TypeSerializer<TSerialized, any> & TypeSerializer.Matchable>
        ) {}

        /** Try to pick a (possibly partial) type serializer for given value */
        public pickForValue(value: any): Partial<TypeSerializer<TSerialized, any>> {

            if (value === null || value === undefined) {
                throw new Error('Expecting value to be not null/undefined');
            }

            let serializer: Partial<TypeSerializer<TSerialized, any>> = {};

            if (!(serializer = this.predefinedSerializers.find(s => s.matchValue(value)))) {
                const type = value.constructor;
                if (typeof(type) !== 'function') {
                    throw new Error(`Expecting value to have a constructor function`);
                }
                const proto = Object.getPrototypeOf(value);
                const meta = MetadataManager.get(this.backend).getOwnOrInheritedMetaFor(proto);
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

            if (typeof(type) !== 'function') {
                throw new Error('Expecting a type constructor function');
            }

            let serializer: Partial<TypeSerializer<TSerialized, any>> = {};

            if (!(serializer = this.predefinedSerializers.find(s => s.matchType(type)))) {
                const meta = MetadataManager.get(this.backend).getOwnOrInheritedMetaFor(type.prototype);
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
            'Hints: Use a serializable type or provide a custom serializer. ' +
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
