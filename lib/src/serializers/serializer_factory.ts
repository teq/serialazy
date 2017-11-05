import Constructable from '../types/constructable';
import JsonType from '../types/json_type';
import BooleanSerializer from './boolean_serializer';
import Metadata from './metadata';
import NumberSerializer from './number_serializer';
import SerializableSerializer from './serializable_serializer';
import Serializer from './serializer';
import StringSerializer from './string_serializer';

namespace SerializerFactory {

    /** Tries to pick a default serializer for given property */
    export function createFor(target: Object, propertyName: string, options: Serializer.Options): Serializer<JsonType, any> {

        const ctor: Constructable<any> = Reflect.getMetadata('design:type', target, propertyName);

        if (ctor === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: "emitDecoratorMetadata" and "experimentalDecorators"');
        }

        if (ctor === String) {
            return new StringSerializer(options);
        } else if (ctor === Number) {
            return new NumberSerializer(options);
        } else if (ctor === Boolean) {
            return new BooleanSerializer(options);
        } else if (ctor.prototype && Metadata.getFor(ctor.prototype)) { // Serializable
            return new SerializableSerializer(options, ctor);
        } else {
            throw new Error(`Unable to find serializer for type: "${ctor.name}". Hint: use serializable type or provide a custom serializer`);
        }

    }

}

export default SerializerFactory;
