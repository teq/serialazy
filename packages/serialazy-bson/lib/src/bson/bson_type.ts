import {
    Binary,
    BSONRegExp,
    Code,
    Decimal128,
    Double,
    Int32,
    Long,
    ObjectId,
    Timestamp
} from 'bson';

export {
    Binary,
    BSONRegExp,
    Code,
    Decimal128,
    Double,
    Int32,
    Long,
    ObjectId,
    Timestamp
};

export interface BsonDocument {
    [prop: string]: BsonType;
}

export interface BsonArray extends Array<BsonType> {}

export type BsonType =
    string | boolean | number | Date |  // JS-types
    Binary | BSONRegExp | Code |        // \
    Decimal128 | Double | Int32 |       // | BSON-specific types
    Long | ObjectId | Timestamp |       // /
    BsonDocument | BsonArray;           // nested BSON types

export default BsonType;
