import chai = require('chai');

import { deflate, inflate, Serialize } from '../@lib/serialazy';

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

});
