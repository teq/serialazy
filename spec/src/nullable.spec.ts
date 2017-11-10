import chai = require('chai');

import { deflate, inflate, Serialize } from '../../.';

const { expect } = chai;

describe('"nullable" option behavior', () => {

    describe('when value is null and option is false/null/undefined (default)', () => {

        class Patient {
            @Serialize() public married: boolean;
            public constructor(married?: boolean) {
                if (married !== undefined) { this.married = married; }
            }
        }

        it('should fail to serialize', () => {
            const patient = new Patient(null);
            expect(() => deflate(patient)).to.throw('Unable to serialize property "married": Value is null');
        });

        it('should fail to deserialize', () => {
            expect(() => inflate(Patient, { married: null })).to.throw('Unable to deserialize property "married": Value is null');
        });

    });

    describe('when value is null and option is true', () => {

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
