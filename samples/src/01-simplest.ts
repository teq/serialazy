import { deserialize, Serializable, serialize } from './@lib/serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // "Serialize" decorator tries to pick a default serializer for given data type
    @Serializable.Prop() public title: string;
    @Serializable.Prop() public pages: number;

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
const serialized = serialize(book); // JSON-compatible object (can be safely passed to `JSON.stringify`)

expect(serialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
    // Notice that "notes" is not serialized
});

// *** Deserialize
const deserialized = deserialize(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
});
