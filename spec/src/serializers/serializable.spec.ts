import chai = require('chai');

import { deflate, inflate, Serialize } from '../../../.';

const { expect } = chai;

describe('default serializer for serializables (serializable objects)', () => {

    class Author {
        @Serialize() public name: string;
        public constructor(name?: string) {
            if (name !== undefined) { this.name = name; }
        }
    }

    class Book {
        @Serialize() public title: string;
        @Serialize() public author: Author;
        public constructor(title?: string, author?: Author) {
            if (title !== undefined) { this.title = title; }
            if (author !== undefined) { this.author = author; }
        }
    }

    describe('when a property is serializable', () => {

        const bookObj = {
            title: 'The Story of the Sealed Room',
            author: { name: 'Arthur Conan Doyle' }
        };

        const book = new Book('The Story of the Sealed Room', new Author('Arthur Conan Doyle'));

        it('serializes to JSON-compatible object', () => {
            const serialized = deflate(book);
            expect(serialized).to.deep.equal(bookObj);
        });

        it('deserializes from JSON-compatible object', () => {
            const deserialized = inflate(Book, bookObj);
            expect(deserialized instanceof Book).to.equal(true);
            expect(deserialized).to.deep.equal(book);
        });

    });

    describe('when a property is a non-serializable', () => {

        class NotSerializableAuthor {
            public name: string;
        }

        it('should fail to decorate it as serializable', () => {
            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class Book {
                    @Serialize() public author: NotSerializableAuthor;
                }
            }).to.throw('Unable to find serializer for type: "NotSerializableAuthor"');
        });

    });

});
