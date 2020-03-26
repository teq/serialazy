import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('custom property serializer', () => {

    it('overrides default/predefined type serializer of given property', () => {

        class Author extends Serializable {
            @Serialize() public name: string;
        }

        class Book extends Serializable {
            @Serialize() public title: string;

            @Serialize({ // should override default `Author` type serializer
                down: (author: Author) => author.name,
                up: (name: string) => Author.create({ name })
            })
            public author: Author;

            @Serialize({ // should override default `boolean` type serializer
                down: (val: boolean) => val ? 1 : 0,
                up: (val) => val ? true : false
            })
            public read: boolean;
        }

        const book = Book.create({
            read: false,
            title: 'Doctor Zhivago',
            author: Author.create({ name: 'Boris Pasternak' })
        });

        const serialized = deflate(book);

        expect(serialized).to.deep.equal({
            read: 0,
            title: 'Doctor Zhivago',
            author: 'Boris Pasternak'
        });

        const deserialized = inflate(Book, serialized);

        expect(deserialized).to.deep.equal(book);

    });

});
