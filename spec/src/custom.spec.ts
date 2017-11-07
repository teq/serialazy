import chai = require('chai');

import { deflate, inflate, Serialize } from '../../.';

const { expect } = chai;

describe('custom serializer', () => {

    it('is able to serialize properties which are not serializable otherwise', () => {

        class Book {

            @Serialize.Custom({
                down: (val: Map<number, string>) => val ? Array.from(val).map(([page, title]) => ({ page, title })) : null,
                up: (val) => val ? new Map(val.map<[number, string]>(ch => [ch.page, ch.title])) : null,
            })
            public contents: Map<number, string>;

            public constructor (contents?: Map<number, string>) {
                if (contents) { this.contents = contents; }
            }

        }

        const book = new Book(new Map([[1, 'Chapter 1'], [21, 'Chapter 2']]));

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

    it('is able to accept options', () => {

        class Book {

            @Serialize.Custom(
                { down: (val: Date) => val ? val.toISOString() : null, up: (val) => val ? new Date(val) : null },
                { name: 'publishDate' }
            )
            public releaseDate: Date;

            public constructor (releaseDate?: Date) {
                if (releaseDate) { this.releaseDate = releaseDate; }
            }

        }

        const book = new Book(new Date('1893'));

        const bookObj = deflate(book);

        expect(bookObj).to.deep.equal({ publishDate: "1893-01-01T00:00:00.000Z" });

        const deserialized = inflate(Book, bookObj);

        expect(deserialized).to.deep.equal(book);

    });

});
