import { BSONRegExp, Double, Int32 } from 'bson';
import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy-bson';

const { expect } = chai;

describe('default type serializer', () => {

    describe('for boolean properties', () => {

        class Book {
            @Serialize() public read: boolean;
        }

        describe('when the value is a boolean', () => {

            describe('of primitive type', () => {

                it('serializes to a boolean primitive', () => {
                    const book = Object.assign(new Book(), { read: true });
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
                    const book = Object.assign(new Book(), { read: new Boolean(true) });
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
                const book = Object.assign(new Book(), { read: new Date() });
                expect(() => deflate(book)).to.throw('Unable to serialize property "read": Not a boolean');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Book, { read: new Date() as any })).to.throw('Unable to deserialize property "read": Not a boolean');
            });

        });

    });

    describe('for number properties', () => {

        class Person {
            @Serialize() public age: number;
        }

        describe('when serialized value is an integer', () => {

            describe('of primitive type', () => {

                it('serializes to BSON Int32', () => {
                    const person = Object.assign(new Person(), { age: 40 });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: new Int32(40) });
                });

            });

            describe('of object type', () => {

                it('serializes to BSON Int32', () => {
                    const person = Object.assign(new Person(), { age: new Number(40) });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: new Int32(40) });
                });

            });

        });

        describe('when serialized value is a non-integer', () => {

            describe('of primitive type', () => {

                it('serializes to BSON Double', () => {
                    const person = Object.assign(new Person(), { age: 40.5 });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: new Double(40.5) });
                });

            });

            describe('of object type', () => {

                it('serializes to BSON Double', () => {
                    const person = Object.assign(new Person(), { age: new Number(40.5) });
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({ age: new Double(40.5) });
                });

            });

        });

        describe('when deserialized value is BSON Int32', () => {

            it('deserializes to a number', () => {
                const deserialized = inflate(Person, { age: new Int32(45) });
                expect(deserialized instanceof Person).to.equal(true);
                expect(deserialized).to.deep.equal({ age: 45 });
            });

        });

        describe('when deserialized value is BSON Double', () => {

            it('deserializes to a number', () => {
                const deserialized = inflate(Person, { age: new Double(45.5) });
                expect(deserialized instanceof Person).to.equal(true);
                expect(deserialized).to.deep.equal({ age: 45.5 });
            });

        });

        describe('when the value is a non-number', () => {

            it('should fail to serialize', () => {
                const person = Object.assign(new Person(), { age: new Date() });
                expect(
                    () => deflate(person)
                ).to.throw('Unable to serialize property "age": Not a number');
            });

            it('should fail to deserialize', () => {
                expect(
                    () => inflate(Person, { age: new Date() as any })
                ).to.throw('Unable to deserialize property "age": Not a Double/Int32');
            });

        });

    });

    describe('for string properties', () => {

        class Greeter {
            @Serialize() public message: string;
        }

        describe('when the value is a string', () => {

            describe('of primitive type', () => {

                it('serializes to a string literal', () => {
                    const greeter = Object.assign(new Greeter(), { message: 'hello' });
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
                    const greeter = Object.assign(new Greeter(), { message: new String('hello') });
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
                const greeter = Object.assign(new Greeter(), { message: new Date() });
                expect(
                    () => deflate(greeter)
                ).to.throw('Unable to serialize property "message": Not a string');
            });

            it('should fail to deserialize', () => {
                expect(
                    () => inflate(Greeter, { message: new Date() as any })
                ).to.throw('Unable to deserialize property "message": Not a string');
            });

        });

    });

    describe('for Date properties', () => {

        class Book {
            @Serialize() public release: Date;
        }

        describe('when the value is a Date', () => {

            it('serializes to a Date', () => {
                const book = Object.assign(new Book(), { release: new Date() });
                const serialized = deflate(book);
                expect(serialized).to.deep.equal(book);
            });

            it('deserializes to a Date', () => {
                const serialized = { release: new Date() };
                const deserialized = inflate(Book, serialized);
                expect(deserialized).to.deep.equal(serialized);
            });

        });

        describe('when the value is not a Date', () => {

            it('should fail to serialize', () => {
                const book = Object.assign(new Book(), { release: 'none' });
                expect(
                    () => deflate(book)
                ).to.throw('Unable to serialize property "release": Not a Date');
            });

            it('should fail to deserialize', () => {
                expect(
                    () => inflate(Book, { release: 123 })
                ).to.throw('Unable to deserialize property "release": Not a Date');
            });

        });

    });

    describe('for RegExp properties', () => {

        class Matcher {
            @Serialize() public exp: RegExp;
        }

        describe('when serialized value is a RegExp', () => {

            it('serializes to a BSONRegExp', () => {
                const matcher = Object.assign(new Matcher(), { exp: /test/i });
                const serialized = deflate(matcher);
                expect(serialized).to.deep.equal({ exp: new BSONRegExp('test', 'i') });
            });

        });

        describe('when serialized value is not a RegExp', () => {

            it('should fail to serialize', () => {
                const matcher = Object.assign(new Matcher(), { exp: 'test' });
                expect(
                    () => deflate(matcher)
                ).to.throw('Unable to serialize property "exp": Not a RegExp');
            });

        });

        describe('when deserialized value is a BSONRegExp', () => {

            it('deserializes to a RegExp', () => {
                const serialized = { exp: new BSONRegExp('test', 'i') };
                const deserialized = inflate(Matcher, serialized);
                expect(deserialized).to.deep.equal({ exp: /test/i });
            });

        });

        describe('when deserialized value is not a BSONRegExp', () => {

            it('should fail to deserialize', () => {
                const serialized = { exp: 'test' };
                expect(
                    () => inflate(Matcher, serialized)
                ).to.throw('Unable to deserialize property "exp": Not a BSONRegExp');
            });

        });

    });

});
