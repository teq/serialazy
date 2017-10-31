import Constructable from '../constructable';
import JsonType from '../json_type';
import Serializer from '../serializer';
import BooleanSerializer from './boolean_serializer';
import Metadata from './metadata';
import NumberSerializer from './number_serializer';
import SerializableSerializer from './serializable_serializer';
import SerializationError from './serialization_error';
import StringSerializer from './string_serializer';

namespace SerializerFactory {

    /** Tries to pick a default serializer for given property */
    export function createFor(target: Object, propertyName: string, options: Serializer.Options): Serializer<JsonType, any> {

        const ctor: Constructable<any> = Reflect.getMetadata('design:type', target, propertyName);

        if (ctor === undefined) {
            throw new Error('Unable to fetch type information. Hint: Enable TS options: `emitDecoratorMetadata` and `experimentalDecorators`');
        }

        if (ctor === String) {
            return new StringSerializer(propertyName, options);
        } else if (ctor === Number) {
            return new NumberSerializer(propertyName, options);
        } else if (ctor === Boolean) {
            return new BooleanSerializer(propertyName, options);
        } else if (ctor.prototype && Metadata.getFor(ctor.prototype)) { // Serializable
            return new SerializableSerializer(propertyName, options, ctor);
        } else {
            throw new SerializationError(`Unable to find serializer for type: "${ctor.name}". Hint: use serializable type or provide a custom serializer`);
        }

    }

}

export default SerializerFactory;
