import chai = require('chai');

import Jsonify, { SerializationError, Serialize } from '../../../.';

const { expect } = chai;

describe('default serializer for string properties', () => {

    class Greeter {
        @Serialize() public message: string;
        public constructor(message?: string) {
            if (message !== undefined) { this.message = message; }
        }
    }

    describe('when the value is a string', () => {

        describe('of primitive type', () => {

            it('serializes to a string literal', () => {
                const greeter = new Greeter('hello');
                const serialized = Jsonify.toJsonObject(greeter);
                expect(serialized).to.deep.equal({ message: 'hello' });
            });

            it('deserializes to a string literal', () => {
                const deserialized = Jsonify.fromJsonObject(Greeter, { message: 'hi' });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized).to.deep.equal({ message: 'hi' });
            });

        });

        describe('of object type', () => {

            it('serializes to a string literal', () => {
                const greeter = new Greeter(new String('hello') as string);
                const serialized = Jsonify.toJsonObject(greeter);
                expect(serialized).to.deep.equal({ message: 'hello' });
            });

            it('deserializes to a string literal', () => {
                const deserialized = Jsonify.fromJsonObject(Greeter, { message: new String('hello') as string });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized).to.deep.equal({ message: 'hello' });
            });

        });

    });

    describe('when the value is a non-string', () => {

        it('should fail to serialize', () => {
            const greeter = new Greeter(new Date() as any);
            expect(() => Jsonify.toJsonObject(greeter)).to.throw(SerializationError, 'not a string');
        });

        it('should fail to deserialize', () => {
            expect(() => Jsonify.fromJsonObject(Greeter, { message: new Date() as any })).to.throw(SerializationError, 'not a string');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const greeter = new Greeter(null);
                expect(() => Jsonify.toJsonObject(greeter)).to.throw(SerializationError, 'Unable to serialize null property');
            });

            it('should fail to deserialize', () => {
                expect(() => Jsonify.fromJsonObject(Greeter, { message: null })).to.throw(SerializationError, 'Unable to deserialize null property');
            });

        });

        describe('and property is nullable', () => {

            class Greeter {
                @Serialize({ nullable: true }) public message: string;
                public constructor(message?: string) {
                    if (message !== undefined) { this.message = message; }
                }
            }

            it('serializes to null', () => {
                const greeter = new Greeter(null);
                const serialized = Jsonify.toJsonObject(greeter);
                expect(serialized).to.deep.equal({ message: null });
            });

            it('deserializes to null', () => {
                const deserialized = Jsonify.fromJsonObject(Greeter, { message: null });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized).to.deep.equal({ message: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const greeter = new Greeter(undefined);
                expect(() => Jsonify.toJsonObject(greeter)).to.throw(SerializationError, 'Unable to serialize undefined property');
            });

            it('should fail to deserialize', () => {
                expect(() => Jsonify.fromJsonObject(Greeter, { message: undefined })).to.throw(SerializationError, 'Unable to deserialize undefined property');
            });

        });

        describe('and property is optional', () => {

            class Greeter {
                @Serialize({ optional: true }) public message: string;
                public constructor(message?: string) {
                    if (message !== undefined) { this.message = message; }
                }
            }

            it('serializes to undefined', () => {
                const greeter = new Greeter(undefined);
                const serialized = Jsonify.toJsonObject(greeter);
                expect(serialized.message).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = Jsonify.fromJsonObject(Greeter, { message: undefined });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized.message).to.equal(undefined);
            });

        });

    });

});
