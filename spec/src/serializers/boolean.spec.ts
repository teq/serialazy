import chai = require('chai');

import { deflate, inflate, Serialize } from '../../../.';

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
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ married: true });
            });

            it('deserializes to a boolean primitive', () => {
                const deserialized = inflate(Patient, { married: false });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: false });
            });

        });

        describe('of object type', () => {

            it('serializes to a boolean primitive', () => {
                const patient = new Patient(new Boolean(true) as boolean);
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ married: true });
            });

            it('deserializes to a boolean primitive', () => {
                const deserialized = inflate(Patient, { married: new Boolean(false) as boolean });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: false });
            });

        });

    });

    describe('when the value is a non-boolean', () => {

        it('should fail to serialize', () => {
            const patient = new Patient(new Date() as any);
            expect(() => deflate(patient)).to.throw('Unable to serialize property "married": Not a boolean');
        });

        it('should fail to deserialize', () => {
            expect(() => inflate(Patient, { married: new Date() as any })).to.throw('Unable to deserialize property "married": Not a boolean');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(null);
                expect(() => deflate(patient)).to.throw('Unable to serialize property "married": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Patient, { married: null })).to.throw('Unable to deserialize property "married": Value is null');
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
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ married: null });
            });

            it('deserializes to null', () => {
                const deserialized = inflate(Patient, { married: null });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(undefined);
                expect(() => deflate(patient)).to.throw('Unable to serialize property "married": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Patient, { married: undefined })).to.throw('Unable to deserialize property "married": Value is undefined');
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
                const serialized = deflate(patient);
                expect(serialized.married).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = inflate(Patient, { married: undefined });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized.married).to.equal(undefined);
            });

        });

    });

});
