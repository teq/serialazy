import chai = require('chai');

import Jsonify, { SerializationError, Serialize } from '../../src/jsonify';

const { expect } = chai;

describe('default serializer for boolean properties', () => {

    class Patient {
        @Serialize() public married: boolean;
        public constructor(married?: boolean) {
            if (married !== undefined) { this.married = married; }
        }
    }

    describe('when the value is a boolean', () => {

        describe('of primitive type', () => {

            it('serializes to a boolean primitive', () => {
                const patient = new Patient(true);
                const serialized = Jsonify.toJsonObject(patient);
                expect(serialized).to.deep.equal({ married: true });
            });

            it('deserializes to a boolean primitive', () => {
                const deserialized = Jsonify.fromJsonObject(Patient, { married: false });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: false });
            });

        });

        describe('of object type', () => {

            it('serializes to a boolean primitive', () => {
                const patient = new Patient(new Boolean(true) as boolean);
                const serialized = Jsonify.toJsonObject(patient);
                expect(serialized).to.deep.equal({ married: true });
            });

            it('deserializes to a boolean primitive', () => {
                const deserialized = Jsonify.fromJsonObject(Patient, { married: new Boolean(false) as boolean });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: false });
            });

        });

    });

    describe('when the value is a non-boolean', () => {

        it('should fail to serialize', () => {
            const patient = new Patient(new Date() as any);
            expect(() => Jsonify.toJsonObject(patient)).to.throw(SerializationError, 'not a boolean');
        });

        it('should fail to deserialize', () => {
            expect(() => Jsonify.fromJsonObject(Patient, { married: new Date() as any })).to.throw(SerializationError, 'not a boolean');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(null);
                expect(() => Jsonify.toJsonObject(patient)).to.throw(SerializationError, 'Unable to serialize null property');
            });

            it('should fail to deserialize', () => {
                expect(() => Jsonify.fromJsonObject(Patient, { married: null })).to.throw(SerializationError, 'Unable to deserialize null property');
            });

        });

        describe('and property is nullable', () => {

            class Patient {
                @Serialize({ nullable: true }) public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('serializes to null', () => {
                const patient = new Patient(null);
                const serialized = Jsonify.toJsonObject(patient);
                expect(serialized).to.deep.equal({ married: null });
            });

            it('deserializes to null', () => {
                const deserialized = Jsonify.fromJsonObject(Patient, { married: null });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(undefined);
                expect(() => Jsonify.toJsonObject(patient)).to.throw(SerializationError, 'Unable to serialize undefined property');
            });

            it('should fail to deserialize', () => {
                expect(() => Jsonify.fromJsonObject(Patient, { married: undefined })).to.throw(SerializationError, 'Unable to deserialize undefined property');
            });

        });

        describe('and property is optional', () => {

            class Patient {
                @Serialize({ optional: true }) public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('serializes to undefined', () => {
                const patient = new Patient(undefined);
                const serialized = Jsonify.toJsonObject(patient);
                expect(serialized.married).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = Jsonify.fromJsonObject(Patient, { married: undefined });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized.married).to.equal(undefined);
            });

        });

    });

});
