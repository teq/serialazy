import chai = require('chai');

import { deflate, inflate, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('"name" option behavior', () => {

    describe('when option is null/undefined/empty', () => {

        class Patient {
            @Serialize({ name: undefined }) public name: string;
            @Serialize({ name: null }) public age: number;
            @Serialize({ name: '' }) public notes : string;
            public constructor(name?: string, age?: number, notes?: string) {
                if (name !== undefined) { this.name = name; }
                if (age !== undefined) { this.age = age; }
                if (notes !== undefined) { this.notes = notes; }
            }
        }

        it('doesn\'t affect property name in resulting serialized object', () => {
            const patient = new Patient('Joe', 35, 'None');
            const serialized = deflate(patient);
            expect(serialized).to.deep.equal({ name: 'Joe', age: 35, notes: 'None' });
            const deserialized = inflate(Patient, serialized);
            expect(deserialized).to.deep.equal(patient);
        });

    });

    describe('when option is a non-empty string', () => {

        class Patient {
            @Serialize() public name: string;
            @Serialize({ name: 'years' }) public age: number;
            public constructor(name?: string, age?: number) {
                if (name !== undefined) { this.name = name; }
                if (age !== undefined) { this.age = age; }
            }
        }

        it('overrides property name in resulting serialized object', () => {
            const patient = new Patient('John', 35);
            const serialized = deflate(patient);
            expect(serialized).to.deep.equal({ name: 'John', years: 35 });
            const deserialized = inflate(Patient, serialized);
            expect(deserialized).to.deep.equal(patient);
        });

    });

});
