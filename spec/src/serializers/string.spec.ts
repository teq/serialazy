import chai = require('chai');

import { deflate, inflate, Serialize } from '../../../.';

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
                const greeter = new Greeter(new String('hello') as string);
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
            const greeter = new Greeter(new Date() as any);
            expect(() => deflate(greeter)).to.throw('Unable to serialize property "message": Not a string');
        });

        it('should fail to deserialize', () => {
            expect(() => inflate(Greeter, { message: new Date() as any })).to.throw('Unable to deserialize property "message": Not a string');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const greeter = new Greeter(null);
                expect(() => deflate(greeter)).to.throw('Unable to serialize property "message": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Greeter, { message: null })).to.throw('Unable to deserialize property "message": Value is null');
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
                const serialized = deflate(greeter);
                expect(serialized).to.deep.equal({ message: null });
            });

            it('deserializes to null', () => {
                const deserialized = inflate(Greeter, { message: null });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized).to.deep.equal({ message: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const greeter = new Greeter(undefined);
                expect(() => deflate(greeter)).to.throw('Unable to serialize property "message": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Greeter, { message: undefined })).to.throw('Unable to deserialize property "message": Value is undefined');
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
                const serialized = deflate(greeter);
                expect(serialized.message).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = inflate(Greeter, { message: undefined });
                expect(deserialized instanceof Greeter).to.equal(true);
                expect(deserialized.message).to.equal(undefined);
            });

        });

    });

});
