import Decorator from '../decorator';
import ObjectPropertySerializer from '../object_property_serializer';
import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonType from './json_type';

const decorator = new Decorator<JsonType>('json');

function isConstructor<T>(protoOrCtor: Object | Constructor<T>): protoOrCtor is Constructor<T> {
    return typeof protoOrCtor === 'function';
}

/** Define serializer for given property or type */
export default function Serialize<TSerialized extends JsonType, TOriginal>(
    params?: TypeSerializer<TSerialized, TOriginal> & ObjectPropertySerializer.Options
) {
    return (protoOrCtor: Object | Constructor<TOriginal>, propertyName?: string) => {
        if (isConstructor(protoOrCtor)) {
            decorator.decorateType(protoOrCtor, params);
        } else {
            decorator.decorateProperty(protoOrCtor, propertyName, params);
        }
    };
}
