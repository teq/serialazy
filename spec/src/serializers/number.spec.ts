import chai = require('chai');

import { deflate, inflate, Serialize } from '../../../.';

const { expect } = chai;

describe('default serializer for number properties', () => {

    class Patient {
        @Serialize() public age: number;
        public constructor(age?: number) {
            if (age !== undefined) { this.age = age; }
        }
    }

    describe('when the value is a number', () => {

        describe('of primitive type', () => {

            it('serializes to a number primitive', () => {
                const patient = new Patient(40);
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ age: 40 });
            });

            it('deserializes to a number primitive', () => {
                const deserialized = inflate(Patient, { age: 45 });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ age: 45 });
            });

        });

        describe('of object type', () => {

            it('serializes to a number primitive', () => {
                const patient = new Patient(new Number(40) as number);
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ age: 40 });
            });

            it('deserializes to a number primitive', () => {
                const deserialized = inflate(Patient, { age: new Number(45) as number });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ age: 45 });
            });

        });

    });

    describe('when the value is a non-number', () => {

        it('should fail to serialize', () => {
            const patient = new Patient(new Date() as any);
            expect(() => deflate(patient)).to.throw('Unable to serialize property "age": Not a number');
        });

        it('should fail to deserialize', () => {
            expect(() => inflate(Patient, { age: new Date() as any })).to.throw('Unable to deserialize property "age": Not a number');
        });

    });

    describe('when the value is null', () => {

        describe('and property is not nullable (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(null);
                expect(() => deflate(patient)).to.throw('Unable to serialize property "age": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Patient, { age: null })).to.throw('Unable to deserialize property "age": Value is null');
            });

        });

        describe('and property is nullable', () => {

            class Patient {
                @Serialize({ nullable: true }) public age: number;
                public constructor(age?: number) {
                    if (age !== undefined) { this.age = age; }
                }
            }

            it('serializes to null', () => {
                const patient = new Patient(null);
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ age: null });
            });

            it('deserializes to null', () => {
                const deserialized = inflate(Patient, { age: null });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ age: null });
            });

        });

    });

    describe('when the value is undefuned', () => {

        describe('and property is not optional (default behavior)', () => {

            it('should fail to serialize', () => {
                const patient = new Patient(undefined);
                expect(() => deflate(patient)).to.throw('Unable to serialize property "age": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => inflate(Patient, { age: undefined })).to.throw('Unable to deserialize property "age": Value is undefined');
            });

        });

        describe('and property is optional', () => {

            class Patient {
                @Serialize({ optional: true }) public age: number;
                public constructor(age?: number) {
                    if (age !== undefined) { this.age = age; }
                }
            }

            it('serializes to undefined', () => {
                const patient = new Patient(undefined);
                const serialized = deflate(patient);
                expect(serialized.age).to.equal(undefined);
            });

            it('deserializes to undefined', () => {
                const deserialized = inflate(Patient, { age: undefined });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized.age).to.equal(undefined);
            });

        });

    });

});
