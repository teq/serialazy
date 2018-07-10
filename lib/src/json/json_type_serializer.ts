import TypeSerializer from '../type_serializer';
import Constructor from '../types/constructor';
import JsonType from './json_type';

type JsonTypeSerializer<TOriginal> = TypeSerializer<JsonType, TOriginal>;

namespace JsonTypeSerializer {

    const picker = new TypeSerializer.Picker<JsonType>('json');

    export const pickForValue = (value: any) => picker.pickForValue(value);
    export const pickForType = (type: Constructor<any>) => picker.pickForType(type);
    export const pickForProp = (proto: Object, propertyName: string) => picker.pickForProp(proto, propertyName);

}

export default JsonTypeSerializer;
