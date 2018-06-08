import chai = require('chai');

import { deserialize, Serializable, serialize } from './@lib/serialazy';

const { expect } = chai;

describe('default property serializer', () => {

    describe('for boolean properties', () => {

        class Patient {
            @Serializable.Prop() public married: boolean;
            public constructor(married?: boolean) {
                if (married !== undefined) { this.married = married; }
            }
        }

        describe('when the value is a boolean', () => {

            describe('of primitive type', () => {

                it('serializes to a boolean primitive', () => {
                    const patient = new Patient(true);
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ married: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = deserialize(Patient, { married: false });
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ married: false });
                });

            });

            describe('of object type', () => {

                it('serializes to a boolean primitive', () => {
                    const patient = new Patient(new Boolean(true) as boolean);
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ married: true });
                });

                it('deserializes to a boolean primitive', () => {
                    const deserialized = deserialize(Patient, { married: new Boolean(false) as boolean });
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ married: false });
                });

            });

        });

        describe('when the value is a non-boolean', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(new Date() as any);
                expect(() => serialize(patient)).to.throw('Unable to serialize property "married": Not a boolean');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Patient, { married: new Date() as any })).to.throw('Unable to deserialize property "married": Not a boolean');
            });

        });

    });

    describe('for number properties', () => {

        class Patient {
            @Serializable.Prop() public age: number;
            public constructor(age?: number) {
                if (age !== undefined) { this.age = age; }
            }
        }

        describe('when the value is a number', () => {

            describe('of primitive type', () => {

                it('serializes to a number primitive', () => {
                    const patient = new Patient(40);
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = deserialize(Patient, { age: 45 });
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

            describe('of object type', () => {

                it('serializes to a number primitive', () => {
                    const patient = new Patient(new Number(40) as number);
                    const serialized = serialize(patient);
                    expect(serialized).to.deep.equal({ age: 40 });
                });

                it('deserializes to a number primitive', () => {
                    const deserialized = deserialize(Patient, { age: new Number(45) as number });
                    expect(deserialized instanceof Patient).to.equal(true);
                    expect(deserialized).to.deep.equal({ age: 45 });
                });

            });

        });

        describe('when the value is a non-number', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(new Date() as any);
                expect(() => serialize(patient)).to.throw('Unable to serialize property "age": Not a number');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Patient, { age: new Date() as any })).to.throw('Unable to deserialize property "age": Not a number');
            });

        });

    });

    describe('for string properties', () => {

        class Greeter {
            @Serializable.Prop() public message: string;
            public constructor(message?: string) {
                if (message !== undefined) { this.message = message; }
            }
        }

        describe('when the value is a string', () => {

            describe('of primitive type', () => {

                it('serializes to a string literal', () => {
                    const greeter = new Greeter('hello');
                    const serialized = serialize(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = deserialize(Greeter, { message: 'hi' });
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hi' });
                });

            });

            describe('of object type', () => {

                it('serializes to a string literal', () => {
                    const greeter = new Greeter(new String('hello') as string);
                    const serialized = serialize(greeter);
                    expect(serialized).to.deep.equal({ message: 'hello' });
                });

                it('deserializes to a string literal', () => {
                    const deserialized = deserialize(Greeter, { message: new String('hello') as string });
                    expect(deserialized instanceof Greeter).to.equal(true);
                    expect(deserialized).to.deep.equal({ message: 'hello' });
                });

            });

        });

        describe('when the value is a non-string', () => {

            it('should fail to serialize', () => {
                const greeter = new Greeter(new Date() as any);
                expect(() => serialize(greeter)).to.throw('Unable to serialize property "message": Not a string');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Greeter, { message: new Date() as any })).to.throw('Unable to deserialize property "message": Not a string');
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
                public constructor(name?: string) {
                    if (name !== undefined) { this.name = name; }
                }
            }

            class Book {
                @Serializable.Prop() public title: string;
                @Serializable.Prop() public author: Author;
                public constructor(title?: string, author?: Author) {
                    if (title !== undefined) { this.title = title; }
                    if (author !== undefined) { this.author = author; }
                }
            }

            const book = new Book('The Story of the Sealed Room', new Author('Arthur Conan Doyle'));

            it('serializes to JSON-compatible object', () => {
                const serialized = serialize(book);
                expect(serialized).to.deep.equal(bookObj);
            });

            it('deserializes from JSON-compatible object', () => {
                const deserialized = deserialize(Book, bookObj);
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.deep.equal(book);
            });

        });

        describe('when a property is a non-serializable', () => {

            class Author {
                public name: string;
                public constructor(name?: string) {
                    if (name !== undefined) { this.name = name; }
                }
            }

            class Book {
                @Serializable.Prop() public title: string;
                @Serializable.Prop() public author: Author;
                public constructor(title?: string, author?: Author) {
                    if (title !== undefined) { this.title = title; }
                    if (author !== undefined) { this.author = author; }
                }
            }

            const book = new Book('The Story of the Sealed Room', new Author('Arthur Conan Doyle'));

            it('should fail to serialize', () => {
                expect(() => serialize(book)).to.throw('No serializer found for type: "Author"');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Book, bookObj)).to.throw('No serializer found for type: "Author"');
            });

        });

    });

});
