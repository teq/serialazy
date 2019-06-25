import Constructor from "../types/constructor";
import Util from '../types/util';
import { Serializable } from "./json_serializable";

// *** Declare pre-defined serializers ***

Serializable({
    down: (original: any) => Util.expectBooleanOrNil(original),
    up: (serialized: any) => Util.expectBooleanOrNil(serialized)
})(Boolean as any as Constructor<boolean>);

Serializable({
    down: (original: any) => Util.expectNumberOrNil(original),
    up: (serialized: any) => Util.expectNumberOrNil(serialized)
})(Number as any as Constructor<number>);

Serializable({
    down: (original: any) => Util.expectStringOrNil(original),
    up: (serialized: any) => Util.expectStringOrNil(serialized)
})(String as any as Constructor<string>);
