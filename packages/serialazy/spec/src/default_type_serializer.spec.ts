import chai = require('chai');

import { deflate, inflate, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

describe('default type serializer', () => {

    describe('for boolean properties', () => {

        class Book extends Serializable {
            @Serialize() public read: boolean;
        }

        describe('when the value is a boolean', () => {

            describe('of primitive type', () => {

                it('serializes to a boolean primitive', () => {
                    const book = Book.create({ read: true });
                    const serialized = deflate(book);
                    expect(serialized).to.deep.equal({ read: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = inflate(Book, { read: false });
                    expect(deserialized instanceof Book).to.equal(true);
                    expect(deserialized).to.deep.equal({ read: false });
                });

            });

            describe('of object type', () => {

                it('serializes to a boolean primitive', () => {
                    const book = Book.create({ read: new Boolean(true) });
                    const serialized = deflate(book);
                    expect(serialized).to.deep.equal({ read: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = inflate(Book, { read: new Boolean(false) as boolean });
                    expect(deserialized instanceof Book).to.equal(true);
                    expect(deserialized).to.deep.equal({ read: false });
                });

            });

        });

        describe('when the value is a non-boolean', () => {

            it('should fail to serialize', () => {
                const book = Book.create({ read: new Date() as any });
                expect(() => deflate(book)).to.throw('Unable to serialize property "read": Not a boolean');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Book, { read: new Date() as any })).to.throw('Unable to deserialize property "read": Not a boolean');
            });

        });

    });

    describe('for number properties', () => {

        class Person extends Serializable {
            @Serialize() public age: number;
        }

        describe('when the value is a number', () => {

            describe('of primitive type', () => {

                it('serializes to a number primitive', () => {
                    const person = Person.create({ age: 40 });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = inflate(Person, { age: 45 });
                    expect(deserialized instanceof Person).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

            describe('of object type', () => {

                it('serializes to a number primitive', () => {
                    const person = Person.create({ age: new Number(40) });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = inflate(Person, { age: new Number(45) as number });
                    expect(deserialized instanceof Person).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

        });

        describe('when the value is a non-number', () => {

            it('should fail to serialize', () => {
                const person = Person.create({ age: new Date() as any });
                expect(() => deflate(person)).to.throw('Unable to serialize property "age": Not a number');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Person, { age: new Date() as any })).to.throw('Unable to deserialize property "age": Not a number');
            });

        });

    });

    describe('for string properties', () => {

        class Greeter extends Serializable {
            @Serialize() public message: string;
        }

        describe('when the value is a string', () => {

            describe('of primitive type', () => {

                it('serializes to a string literal', () => {
                    const greeter = Greeter.create({ message: 'hello' });
                    const serialized = deflate(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = inflate(Greeter, { message: 'hi' });
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hi' });
                });

            });

            describe('of object type', () => {

                it('serializes to a string literal', () => {
                    const greeter = Greeter.create({ message: new String('hello') });
                    const serialized = deflate(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = inflate(Greeter, { message: new String('hello') as string });
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hello' });
                });

            });

        });

        describe('when the value is a non-string', () => {

            it('should fail to serialize', () => {
                const greeter = Greeter.create({ message: new Date() as any });
                expect(() => deflate(greeter)).to.throw('Unable to serialize property "message": Not a string');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Greeter, { message: new Date() as any })).to.throw('Unable to deserialize property "message": Not a string');
            });

        });

    });

    describe('for non-primitive properties', () => {

        const bookObj = {
            title: 'The Story of the Sealed Room',
            author: { name: 'Arthur Conan Doyle' }
        };

        describe('when a property is serializable', () => {

            class Author extends Serializable {
                @Serialize() public name: string;
            }

            class Book extends Serializable {
                @Serialize() public title: string;
                @Serialize() public author: Author;
            }

            const book = Book.create({
                title: 'The Story of the Sealed Room',
                author: Author.create({ name: 'Arthur Conan Doyle' })
            });

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

            class Author extends Serializable {
                public name: string;
            }

            class Book extends Serializable {
                @Serialize() public title: string;
                @Serialize() public author: Author;
            }

            const book = Book.create({
                title: 'The Story of the Sealed Room',
                author: Author.create({ name: 'Arthur Conan Doyle' })
            });

            it('should fail to serialize', () => {
                expect(() => deflate(book)).to.throw('Serializer function ("down") for type "Author" is not defined.');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Book, bookObj)).to.throw('Deserializer function ("up") for type "Author" is not defined.');
            });

        });

    });

});
