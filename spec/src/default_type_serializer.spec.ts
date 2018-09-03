import chai = require('chai');

import { deserialize, Serializable, serialize } from 'serialazy';

const { expect } = chai;

describe('default type serializer', () => {

    describe('for boolean properties', () => {

        class Book {
            @Serializable.Prop() public read: boolean;
        }

        describe('when the value is a boolean', () => {

            describe('of primitive type', () => {

                it('serializes to a boolean primitive', () => {
                    const book = Object.assign(new Book(), { read: true });
                    const serialized = serialize(book);
                    expect(serialized).to.deep.equal({ read: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = deserialize({ read: false }, Book);
                    expect(deserialized instanceof Book).to.equal(true);
                    expect(deserialized).to.deep.equal({ read: false });
                });

            });

            describe('of object type', () => {

                it('serializes to a boolean primitive', () => {
                    const book = Object.assign(new Book(), { read: new Boolean(true) });
                    const serialized = serialize(book);
                    expect(serialized).to.deep.equal({ read: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = deserialize({ read: new Boolean(false) as boolean }, Book);
                    expect(deserialized instanceof Book).to.equal(true);
                    expect(deserialized).to.deep.equal({ read: false });
                });

            });

        });

        describe('when the value is a non-boolean', () => {

            it('should fail to serialize', () => {
                const book = Object.assign(new Book(), { read: new Date() });
                expect(() => serialize(book)).to.throw('Unable to serialize property "read": Not a boolean');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize({ read: new Date() as any }, Book)).to.throw('Unable to deserialize property "read": Not a boolean');
            });

        });

    });

    describe('for number properties', () => {

        class Patient {
            @Serializable.Prop() public age: number;
        }

        describe('when the value is a number', () => {

            describe('of primitive type', () => {

                it('serializes to a number primitive', () => {
                    const patient = Object.assign(new Patient(), { age: 40 });
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = deserialize({ age: 45 }, Patient);
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

            describe('of object type', () => {

                it('serializes to a number primitive', () => {
                    const patient = Object.assign(new Patient(), { age: new Number(40) });
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = deserialize({ age: new Number(45) as number }, Patient);
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

        });

        describe('when the value is a non-number', () => {

            it('should fail to serialize', () => {
                const patient = Object.assign(new Patient(), { age: new Date() });
                expect(() => serialize(patient)).to.throw('Unable to serialize property "age": Not a number');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize({ age: new Date() as any }, Patient)).to.throw('Unable to deserialize property "age": Not a number');
            });

        });

    });

    describe('for string properties', () => {

        class Greeter {
            @Serializable.Prop() public message: string;
        }

        describe('when the value is a string', () => {

            describe('of primitive type', () => {

                it('serializes to a string literal', () => {
                    const greeter = Object.assign(new Greeter(), { message: 'hello' });
                    const serialized = serialize(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = deserialize({ message: 'hi' }, Greeter);
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hi' });
                });

            });

            describe('of object type', () => {

                it('serializes to a string literal', () => {
                    const greeter = Object.assign(new Greeter(), { message: new String('hello') });
                    const serialized = serialize(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = deserialize({ message: new String('hello') as string }, Greeter);
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hello' });
                });

            });

        });

        describe('when the value is a non-string', () => {

            it('should fail to serialize', () => {
                const greeter = Object.assign(new Greeter(), { message: new Date() });
                expect(() => serialize(greeter)).to.throw('Unable to serialize property "message": Not a string');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize({ message: new Date() as any }, Greeter)).to.throw('Unable to deserialize property "message": Not a string');
            });

        });

    });

    describe('for non-primitive properties', () => {

        const bookObj = {
            title: 'The Story of the Sealed Room',
            author: { name: 'Arthur Conan Doyle' }
        };

        describe('when a property is serializable', () => {

            class Author {
                @Serializable.Prop() public name: string;
            }

            class Book {
                @Serializable.Prop() public title: string;
                @Serializable.Prop() public author: Author;
            }

            const book = Object.assign(new Book(), {
                title: 'The Story of the Sealed Room',
                author: Object.assign(new Author(), { name: 'Arthur Conan Doyle' })
            });

            it('serializes to JSON-compatible object', () => {
                const serialized = serialize(book);
                expect(serialized).to.deep.equal(bookObj);
            });

            it('deserializes from JSON-compatible object', () => {
                const deserialized = deserialize(bookObj, Book);
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.deep.equal(book);
            });

        });

        describe('when a property is a non-serializable', () => {

            class Author {
                public name: string;
            }

            class Book {
                @Serializable.Prop() public title: string;
                @Serializable.Prop() public author: Author;
            }

            const book = Object.assign(new Book(), {
                title: 'The Story of the Sealed Room',
                author: Object.assign(new Author(), { name: 'Arthur Conan Doyle' })
            });

            it('should fail to serialize', () => {
                expect(() => serialize(book)).to.throw('Serializer function ("down") for type "Author" is not defined.');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(bookObj, Book)).to.throw('Deserializer function ("up") for type "Author" is not defined.');
            });

        });

    });

});
