import ObjectPropertySerializer from '../object_property_serializer';
import ObjectSerializable from '../object_serializable';
import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonType from './json_type';

namespace JsonSerializable {

    const jsonSerializable = new ObjectSerializable<JsonType>('json');

    /** Use default JSON type serializer for given property */
    export function Prop(
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    /** Use custom JSON type serializer for given property */
    export function Prop<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
        options?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void;

    export function Prop<TSerialized extends JsonType, TOriginal>(
        optionsOrCustomTypeSerializer: ObjectPropertySerializer.Options | TypeSerializer<TSerialized, TOriginal>,
        maybeOptions?: ObjectPropertySerializer.Options
    ): (proto: Object, propertyName: string) => void {
        return jsonSerializable.propertyDecorator(
            optionsOrCustomTypeSerializer as TypeSerializer<TSerialized, TOriginal>,
            maybeOptions as ObjectPropertySerializer.Options
        );
    }

    /** Use custom JSON serializer for given type */
    export function Type<TSerialized extends JsonType, TOriginal>(
        customTypeSerializer: TypeSerializer<TSerialized, TOriginal>,
    ): (ctor: Constructor<TOriginal>) => void {
        return jsonSerializable.typeDecorator(customTypeSerializer);
    }

}

export default JsonSerializable;
