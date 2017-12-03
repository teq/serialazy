import chai = require('chai');

import { deflate, inflate, Serialize } from '../@lib/serialazy';

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

});
