import { deserialize, Serializable, serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // A custom serializer which converts Date to ISO date string
    @Serializable.Prop({
        down: (val: Date) => val.toISOString(),
        up: (val) => new Date(val)
    }, { name: 'releaseDate' }) // Note that custom serializer can accept options
    public publicationDate: Date;

    // A custom serializer which converts Map to a JSON-compatible array of objects
    @Serializable.Prop({
        down: (val: Map<number, string>) => Array.from(val).map(([page, title]) => ({ page, title })),
        up: (val) => new Map(val.map<[number, string]>(ch => [ch.page, ch.title])),
    })
    public contents: Map<number, string>;

}

// *** Create instance
const book = Object.assign(new Book(), {
    publicationDate: new Date('1893-02-01T00:00:00.000Z'),
    contents: new Map([
        [1, 'Introduction'],
        [5, 'Chapter 1'],
        [9, 'Chapter 2']
    ])
});

// *** Serialize
const serialized = serialize(book);

expect(serialized).to.deep.equal({
    releaseDate: '1893-02-01T00:00:00.000Z',
    contents: [
        { page: 1, title: 'Introduction' },
        { page: 5, title: 'Chapter 1' },
        { page: 9, title: 'Chapter 2' }
    ]
});

// *** Deserialize
const deserialized = deserialize(serialized, Book);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);
