import chai = require('chai');

import { deserialize, Serializable, serialize } from 'serialazy';

const { expect } = chai;

describe('custom property serializer', () => {

    it('accepts custom type serializer', () => {

        class Book {
            @Serializable.Prop({
                down: (val: Map<number, string>) => val ? Array.from(val).map(([page, title]) => ({ page, title })) : null,
                up: (val) => val ? new Map(val.map<[number, string]>(ch => [ch.page, ch.title])) : null,
            })
            public contents: Map<number, string>;
        }

        const book = Object.assign(new Book(), { contents: new Map([[1, 'Chapter 1'], [21, 'Chapter 2']]) });

        const bookObj = serialize(book);

        expect(bookObj).to.deep.equal({
            contents: [
                { page: 1, title: "Chapter 1" },
                { page: 21, title: "Chapter 2" }
            ]
        });

        const deserialized = deserialize(bookObj, Book);

        expect(deserialized).to.deep.equal(book);

    });

    it('overrides default (predefined) type serializer of given property', () => {

        class Author {
            @Serializable.Prop() public name: string;
        }

        class Book {
            @Serializable.Prop() public title: string;

            @Serializable.Prop({ // should override debault `Author` type serializer
                down: (author: Author) => author.name,
                up: (name: string) => Object.assign(new Author(), { name })
            })
            public author: Author;

            @Serializable.Prop({ // should override default `boolean` type serializer
                down: (val: boolean) => val ? 1 : 0,
                up: (val) => val ? true : false
            })
            public read: boolean;
        }

        const book = Object.assign(new Book(), {
            read: false,
            title: 'Doctor Zhivago',
            author: Object.assign(new Author(), {
                name: 'Boris Pasternak'
            })
        });

        const serialized = serialize(book);

        expect(serialized).to.deep.equal({
            read: 0,
            title: 'Doctor Zhivago',
            author: 'Boris Pasternak'
        });

        const deserialized = deserialize(serialized, Book);

        expect(deserialized).to.deep.equal(book);

    });

    it('accepts options', () => {

        class Book {
            @Serializable.Prop(
                { down: (val: Date) => val ? val.toISOString() : null, up: (val) => val ? new Date(val) : null },
                { name: 'publishDate' }
            )
            public releaseDate: Date;
        }

        const book = Object.assign(new Book(), { releaseDate: new Date('1893') });

        const bookObj = serialize(book);

        expect(bookObj).to.deep.equal({ publishDate: "1893-01-01T00:00:00.000Z" });

        const deserialized = deserialize(bookObj, Book);

        expect(deserialized).to.deep.equal(book);

    });

});
