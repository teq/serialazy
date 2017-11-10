import { deflate, inflate, Serialize } from '../../.';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Author {
    @Serialize() public name: string;
}

class Book {
    @Serialize() public title: string;
    @Serialize() public author: Author; // Serializes Author recursively
}

// *** Create instance
const book = Object.assign(new Book(), {
    title: 'The Adventure of the Yellow Face',
    author: Object.assign(new Author(), {
        name: 'Arthur Conan Doyle'
    }),
});

// *** Serialize
const serialized = deflate(book);

expect(serialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    author: {
        name: 'Arthur Conan Doyle'
    }
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);
