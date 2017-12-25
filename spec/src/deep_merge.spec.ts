import chai = require('chai');

import { deepMerge, deflate, inflate, isSerializable, Json, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('"deepMerge" function', () => {

    it('throws if destination is null/undefined', () => {
        const errMessage = 'Expecting `destination` to be not null/undefined';
        expect(() => deepMerge(null, null)).to.throw(errMessage);
        expect(() => deepMerge(undefined, null)).to.throw(errMessage);
    });

    it('throws if destination is not serializable', () => {
        expect(() => deepMerge({}, null)).to.throw('Provided type doesn\'t seem to be serializable');
    });

    it('does nothing if source is null/undefined', () => {
        class Book { @Serialize() public title: string; }
        const book = new Book();
        expect(deepMerge(book, null)).to.deep.equal(book);
        expect(deepMerge(book, undefined)).to.deep.equal(book);
    });

    it('recursively merges all serializable properties from source to destination', () => {

        class Author {
            @Serialize() public name: string;
        }

        class Book {
            @Serialize() public title: string;
            @Serialize() public author: Author;
        }

        const bookLike: Book = {
            title: 'The Story of the Sealed Room',
            author: {
                name: 'Arthur Conan Doyle'
            }
        };

        expect(isSerializable(bookLike)).to.equal(false);
        const book = deepMerge(new Book(), bookLike);
        expect(isSerializable(book)).to.equal(true);
        expect(book).to.deep.equal(bookLike);
        const serialized = deflate(book);
        expect(serialized).to.deep.equal(bookLike);

    });

    describe('for custom serializers of union type', () => {

        abstract class Shape {
            @Serialize() public abstract type: 'circle' | 'square';
        }

        class Circle extends Shape {
            public type: 'circle';
            @Serialize() public radius: number;
        }

        class Square extends Shape {
            public type: 'square';
            @Serialize() public side: number;
        }

        class Document {
            @Serialize.Custom({
                down: (val: Circle | Square) => deflate(val),
                up: (val: Json.JsonMap) => {
                    // TODO: think about using `discriminate` here to avoid almost duplicate `switch`
                    switch (val.type) {
                        case 'circle': return inflate(Circle, val);
                        case 'square': return inflate(Square, val);
                        default: throw new Error(`Unknown shape: ${val.type}`);
                    }
                },
                discriminate: ({ type }) => { // required for `deepMerge` to narrow down a type
                    switch (type) {
                        case 'circle': return Circle;
                        case 'square': return Square;
                        default: ((type: never) => { throw new Error(`Unknown shape: ${type}`); })(type);
                    }
                }
            })
            public shape: Circle | Square;
        }

        it('is able to deduce a concrete type of union-type property using "discriminate"', () => {

            const documentLike: Document = {
                shape: {
                    type: 'circle',
                    radius: 12
                }
            };

            const document = deepMerge(new Document(), documentLike);
            expect(document).to.deep.equal(documentLike);
            const serialized = deflate(document);
            expect(serialized).to.deep.equal(documentLike);

        });

    });

});
