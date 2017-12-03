import chai = require('chai');

import { deflate, inflate, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('"optional" option behavior', () => {

    describe('when value is undefined and option is false/null/undefined (default)', () => {

        class Patient {
            @Serialize() public married: boolean;
            public constructor(married?: boolean) {
                if (married !== undefined) { this.married = married; }
            }
        }

        it('should fail to serialize', () => {
            const patient = new Patient(undefined);
            expect(() => deflate(patient)).to.throw('Unable to serialize property "married": Value is undefined');
        });

        it('should fail to deserialize', () => {
            expect(() => inflate(Patient, { married: undefined })).to.throw('Unable to deserialize property "married": Value is undefined');
        });

    });

    describe('when value is undefined and option is true', () => {

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
