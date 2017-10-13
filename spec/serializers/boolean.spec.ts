import chai = require('chai');

import Constructable from '../../src/constructable';
import SerializationError from '../../src/errors/serialization_error';
import Serialize from '../../src/serialize';
import Serializer from '../../src/serializer';

const { expect } = chai;

describe('default serializer for boolean properties', () => {

    describe('when the value is a boolean', () => {

        interface Patient {
            married: boolean | Boolean;
        }

        describe('of primitive type', () => {

            class PatientImpl implements Patient {
                @Serialize()
                // tslint:disable-next-line:no-inferrable-types
                public married: boolean = true;
            }

            testOn(PatientImpl, true);

        });

        describe('of object type', () => {

            class PatientImpl implements Patient {
                @Serialize()
                public married: Boolean = new Boolean(false);
            }

            testOn(PatientImpl, false);

        });

        function testOn<T extends Patient>(ctor: Constructable<T>, married: boolean) {

            it('serializes to a boolean primitive', () => {
                const patient = new ctor();
                const serialized = Serializer.toJsonObject(patient);
                expect(typeof serialized.married).to.equal('boolean');
                expect(serialized).to.deep.equal({ married });
            });

            it('deserializes to a boolean primitive', () => {
                const deserialized = Serializer.fromJsonObject(ctor, { married });
                expect(deserialized instanceof ctor).to.equal(true);
                expect(typeof deserialized.married).to.equal('boolean');
                expect(deserialized).to.deep.equal({ married });
            });

        }

    });

    describe('when the value is a non-boolean', () => {

        class Patient {
            @Serialize()
            public married: boolean = new Date() as any;
        }

        it('should fail to serialize', () => {
            const patient = new Patient();
            expect(() => Serializer.toJsonObject(patient)).to.throw(SerializationError, 'not a boolean');
        });

        it('should fail to deserialize', () => {
            expect(() => Serializer.fromJsonObject(Patient, { married: new Date() as any })).to.throw(SerializationError, 'not a boolean');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            class Patient {
                @Serialize()
                public married: boolean = null;
            }

            it('should fail to serialize', () => {
                const entity = new Patient();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize null property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Patient, { married: null })).to.throw(SerializationError, 'Unable to deserialize null property');
            });

        });

        describe('and property is nullable', () => {

            class Patient {
                @Serialize({ nullable: true })
                public married: boolean = null;
            }

            it('serializes to null', () => {
                const entity = new Patient();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized).to.deep.equal({ married: null });
            });

            it('deserializes to null', () => {
                const deserialized = Serializer.fromJsonObject(Patient, { married: null });
                expect(deserialized).to.deep.equal({ married: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            class Patient {
                @Serialize()
                public married: boolean = undefined;
            }

            it('should fail to serialize', () => {
                const entity = new Patient();
                expect(() => Serializer.toJsonObject(entity)).to.throw(SerializationError, 'Unable to serialize undefined property');
            });

            it('should fail to deserialize', () => {
                expect(() => Serializer.fromJsonObject(Patient, { married: undefined })).to.throw(SerializationError, 'Unable to deserialize undefined property');
            });

        });

        describe('and property is optional', () => {

            class Patient {
                @Serialize({ optional: true })
                public married: boolean = undefined;
            }

            it('serializes to undefined', () => {
                const entity = new Patient();
                const serialized = Serializer.toJsonObject(entity);
                expect(serialized.married).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = Serializer.fromJsonObject(Patient, { married: undefined });
                expect(deserialized.married).to.equal(undefined);
            });

        });

    });

});
