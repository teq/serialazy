import { isSerializable, Serialize } from './@lib/serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition

class Book {
    @Serialize() public title: string;
}

class Author {
    public name: string;
}

// *** Check

expect(isSerializable(new Book())).to.equal(true); // serializable
expect(isSerializable(new Author())).to.equal(false); // not serializable
expect(isSerializable(123)).to.equal(false); // not serializable
expect(isSerializable('test')).to.equal(false); // not serializable
