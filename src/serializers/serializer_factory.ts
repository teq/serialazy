import Constructable from '../constructable';
import JsonType from '../json_type';

import BooleanSerializer from './boolean_serializer';
import NumberSerializer from './number_serializer';
import Serializer from './serializer';
import StringSerializer from './string_serializer';

namespace SerializerFactory {

    export function createFor(target: Object, propertyName: string, options: Serializer.Options): Serializer<JsonType, any> {

        const type: Constructable<any> = Reflect.getMetadata('design:type', target, propertyName);

        switch (type) {
            case String:
                return new StringSerializer(propertyName, options);
            case Number:
                return new NumberSerializer(propertyName, options);
            case Boolean:
                return new BooleanSerializer(propertyName, options);
            default:
                throw new Error(`Unknown type: ${type.name}`);
        }

    }

}

export default SerializerFactory;
