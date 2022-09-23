import {
    Binary,
    BSONRegExp,
    Code,
    Decimal128,
    Double,
    Int32,
    Long,
    ObjectID,
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
    ObjectID,
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
    Long | ObjectID | Timestamp |       // /
    BsonDocument | BsonArray;           // nested BSON types

export default BsonType;
