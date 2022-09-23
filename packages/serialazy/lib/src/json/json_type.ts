
/** JSON primitive type */
export type JsonPrimitive = string | number | boolean | null;

/** JSON array */
export interface JsonArray extends Array<JsonType> {}

/** JSON object */
export interface JsonObject { [prop: string]: JsonType; }

/** JSON-compatible type */
export type JsonType = JsonPrimitive | JsonArray | JsonObject;

export default JsonType;
