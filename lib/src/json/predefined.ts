import Constructor from "../types/constructor";
import Util from '../types/util';
import JsonSerializable from "./json_serializable";

// *** Declare pre-defined serializers ***

JsonSerializable.Type({
    down: (original: any) => Util.expectBooleanOrNil(original),
    up: (serialized: any) => Util.expectBooleanOrNil(serialized)
})(Boolean as any as Constructor<boolean>);

JsonSerializable.Type({
    down: (original: any) => Util.expectNumberOrNil(original),
    up: (serialized: any) => Util.expectNumberOrNil(serialized)
})(Number as any as Constructor<number>);

JsonSerializable.Type({
    down: (original: any) => Util.expectStringOrNil(original),
    up: (serialized: any) => Util.expectStringOrNil(serialized)
})(String as any as Constructor<string>);
