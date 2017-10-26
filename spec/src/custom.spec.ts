import chai = require('chai');

import Jsonify, { Serialize } from '../../.';

const { expect } = chai;

class Book {

    @Serialize.Custom({ down: (val: Date) => val ? val.toISOString() : null, up: (val) => val ? new Date(val) : null })
    public releaseDate: Date;

    @Serialize.Custom({
        down: (val: Map<number, string>) => val ? Array.from(val).map(([page, title]) => ({ page, title })) : null,
        up: (val) => val ? new Map(val.map<[number, string]>(ch => [ch.page, ch.title])) : null,
    })
    public contents: Map<number, string>;

    public constructor (releaseDate?: Date, contents?: Map<number, string>) {
        if (releaseDate) { this.releaseDate = releaseDate; }
        if (contents) { this.contents = contents; }
    }

}

describe('custom serializer', () => {

    it('is able to serialize properties which are not serializable otherwise', () => {

        const book = new Book(new Date('1893'), new Map([[1, 'Chapter 1'], [21, 'Chapter 2']]));

        const bookObj = Jsonify.toJsonObject(book);

        expect(bookObj).to.deep.equal({
            "releaseDate": "1893-01-01T00:00:00.000Z",
            "contents": [
                { "page": 1, "title": "Chapter 1" },
                { "page": 21, "title": "Chapter 2" }
            ]
        });

        const deserialized = Jsonify.fromJsonObject(Book, bookObj);

        expect(deserialized).to.deep.equal(book);

    });

});
