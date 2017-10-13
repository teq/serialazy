import chai = require('chai');

import Constructable from '../../src/constructable';
import SerializationError from '../../src/errors/serialization_error';
import Serialize from '../../src/serialize';
import Serializer from '../../src/serializer';

const { expect } = chai;

describe('default serializer for string properties', () => {

    describe('when the value is a string', () => {

        interface Greeter {
            message: string | String;
        }

        describe('of primitive type', () => {

            class GreeterImpl implements Greeter {
                @Serialize()
                // tslint:disable-next-line:no-inferrable-types
                public message: string = 'hello';
            }

            testOn(GreeterImpl, 'hello');

        });

        describe('of object type', () => {

            class GreeterImpl implements Greeter {
                @Serialize()
                public message: String = new String('hey');
            }

            testOn(GreeterImpl, 'hey');

        });

        function testOn<T extends Greeter>(ctor: Constructable<T>, message: string) {

            it('serializes to a string literal', () => {
                const greeter = new ctor();
                const serialized = Serializer.toJsonObject(greeter);
                expect(typeof serialized.message).to.equal('string');
                expect(serialized).to.deep.equal({ message });
            });

            it('deserializes to a string literal', () => {
                const deserialized = Serializer.fromJsonObject(ctor, { message });
                expect(deserialized instanceof ctor).to.equal(true);
                expect(typeof deserialized.message).to.equal('string');
                expect(deserialized).to.deep.equal({ message });
            });

        }

    });

    describe('when the value is a non-string', () => {

        class Greeter {
            @Serialize()
            public message: string = new Date() as any;
        }

        it('should fail to serialize', () => {
            const greeter = new Greeter();
            expect(() => Serializer.toJsonObject(greeter)).to.throw(SerializationError, 'not a string');
        });

        it('should fail to deserialize', () => {
            expect(() => Serializer.fromJsonObject(Greeter, { message: new Date() as any })).to.throw(SerializationError, 'not a string');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            class Greeter {
                @Serialize()
                public message: string = null;
            }

            it('should fail to serialize', () => {
                const entity = new Greeter();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize null property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Greeter, { message: null })).to.throw(SerializationError, 'Unable to deserialize null property');
            });

        });

        describe('and property is nullable', () => {

            class Greeter {
                @Serialize({ nullable: true })
                public message: string = null;
            }

            it('serializes to null', () => {
                const entity = new Greeter();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized).to.deep.equal({ message: null });
            });

            it('deserializes to null', () => {
                const deserialized = Serializer.fromJsonObject(Greeter, { message: null });
                expect(deserialized).to.deep.equal({ message: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            class Greeter {
                @Serialize()
                public message: string = undefined;
            }

            it('should fail to serialize', () => {
                const entity = new Greeter();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize undefined property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Greeter, { message: undefined })).to.throw(SerializationError, 'Unable to deserialize undefined property');
            });

        });

        describe('and property is optional', () => {

            class Greeter {
                @Serialize({ optional: true })
                public message: string = undefined;
            }

            it('serializes to undefined', () => {
                const entity = new Greeter();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized.message).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = Serializer.fromJsonObject(Greeter, { message: undefined });
                expect(deserialized.message).to.equal(undefined);
            });

        });

    });

});
