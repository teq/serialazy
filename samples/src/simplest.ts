import { deflate, inflate, Serialize } from './@lib/serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // "Serialize" decorator tries to pick a default serializer for given data type
    @Serialize() public title: string;
    @Serialize() public pages: number;

    // Properties not decorated by `Serialize` are NOT serialized
    public notes: string;

}

// *** Create instance
const book = Object.assign(new Book(), {
    title: 'The Adventure of the Yellow Face',
    pages: 123,
    notes: 'Interesting story'
});

// *** Serialize
const serialized = deflate(book); // JSON-compatible object (can be safely passed to `JSON.stringify`)

expect(serialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
    // Notice that "notes" is not serialized
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
});
