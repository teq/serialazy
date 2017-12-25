import chai = require('chai');

import { deflate, inflate, Serialize } from '../@lib/serialazy';

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

});
