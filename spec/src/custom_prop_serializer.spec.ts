import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('custom property serializer', () => {

    it('accepts custom type serializer', () => {

        class Book extends Serializable {
            @Serialize({
                down: (val: Map<number, string>) => val ? Array.from(val).map(([page, title]) => ({ page, title })) : null,
                up: (val) => val ? new Map(val.map<[number, string]>(ch => [ch.page, ch.title])) : null,
            })
            public contents: Map<number, string>;
        }

        const book = Book.create({ contents: new Map([[1, 'Chapter 1'], [21, 'Chapter 2']]) });

        const bookObj = deflate(book);

        expect(bookObj).to.deep.equal({
            contents: [
                { page: 1, title: "Chapter 1" },
                { page: 21, title: "Chapter 2" }
            ]
        });

        const deserialized = inflate(Book, bookObj);

        expect(deserialized).to.deep.equal(book);

    });

    it('overrides default (predefined) type serializer of given property', () => {

        class Author extends Serializable {
            @Serialize() public name: string;
        }

        class Book extends Serializable {
            @Serialize() public title: string;

            @Serialize({ // should override debault `Author` type serializer
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

    it('accepts options', () => {

        class Book extends Serializable {
            @Serialize({
                name: 'publishDate',
                down: (val: Date) => val ? val.toISOString() : null,
                up: (val) => val ? new Date(val) : null
            })
            public releaseDate: Date;
        }

        const book = Book.create({ releaseDate: new Date('1893') });

        const bookObj = deflate(book);

        expect(bookObj).to.deep.equal({ publishDate: "1893-01-01T00:00:00.000Z" });

        const deserialized = inflate(Book, bookObj);

        expect(deserialized).to.deep.equal(book);

    });

});
