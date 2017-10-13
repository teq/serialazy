import chai = require('chai');

import Constructable from '../../src/constructable';
import SerializationError from '../../src/errors/serialization_error';
import Serialize from '../../src/serialize';
import Serializer from '../../src/serializer';

const { expect } = chai;

describe('default serializer for number properties', () => {

    describe('when the value is a number', () => {

        interface Patient {
            age: number | Number;
        }

        describe('of primitive type', () => {

            class PatientImpl implements Patient {
                @Serialize()
                // tslint:disable-next-line:no-inferrable-types
                public age: number = 40;
            }

            testOn(PatientImpl, 40);

        });

        describe('of object type', () => {

            class PatientImpl implements Patient {
                @Serialize()
                public age: Number = new Number(45);
            }

            testOn(PatientImpl, 45);

        });

        function testOn<T extends Patient>(ctor: Constructable<T>, age: number) {

            it('serializes to a number primitive', () => {
                const patient = new ctor();
                const serialized = Serializer.toJsonObject(patient);
                expect(typeof serialized.age).to.equal('number');
                expect(serialized).to.deep.equal({ age });
            });

            it('deserializes to a number primitive', () => {
                const deserialized = Serializer.fromJsonObject(ctor, { age });
                expect(deserialized instanceof ctor).to.equal(true);
                expect(typeof deserialized.age).to.equal('number');
                expect(deserialized).to.deep.equal({ age });
            });

        }

    });

    describe('when the value is a non-number', () => {

        class Patient {
            @Serialize()
            public age: number = new Date() as any;
        }

        it('should fail to serialize', () => {
            const patient = new Patient();
            expect(() => Serializer.toJsonObject(patient)).to.throw(SerializationError, 'not a number');
        });

        it('should fail to deserialize', () => {
            expect(() => Serializer.fromJsonObject(Patient, { age: new Date() as any })).to.throw(SerializationError, 'not a number');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            class Patient {
                @Serialize()
                public age: number = null;
            }

            it('should fail to serialize', () => {
                const entity = new Patient();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize null property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Patient, { age: null })).to.throw(SerializationError, 'Unable to deserialize null property');
            });

        });

        describe('and property is nullable', () => {

            class Patient {
                @Serialize({ nullable: true })
                public age: number = null;
            }

            it('serializes to null', () => {
                const entity = new Patient();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized).to.deep.equal({ age: null });
            });

            it('deserializes to null', () => {
                const deserialized = Serializer.fromJsonObject(Patient, { age: null });
                expect(deserialized).to.deep.equal({ age: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            class Patient {
                @Serialize()
                public age: number = undefined;
            }

            it('should fail to serialize', () => {
                const entity = new Patient();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize undefined property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Patient, { age: undefined })).to.throw(SerializationError, 'Unable to deserialize undefined property');
            });

        });

        describe('and property is optional', () => {

            class Patient {
                @Serialize({ optional: true })
                public age: number = undefined;
            }

            it('serializes to undefined', () => {
                const entity = new Patient();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized.age).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = Serializer.fromJsonObject(Patient, { age: undefined });
                expect(deserialized.age).to.equal(undefined);
            });

        });

    });

});
