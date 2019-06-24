import { deflate, inflate, Serializable } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Author {
    @Serializable.Prop() public name: string;
}

class Book {
    @Serializable.Prop() public title: string;
    @Serializable.Prop() public author: Author; // Serializes Author recursively
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
const deserialized = inflate(serialized, Book);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);
