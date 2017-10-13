
export type JsonPrimitive = string | number | boolean | null;
export interface JsonArray extends Array<JsonType> {}
export interface JsonMap { [prop: string]: JsonType; }
export type JsonType = JsonPrimitive | JsonArray | JsonMap;

export default JsonType;
