import chai = require('chai');

import { deflate, inflate, Serialize } from '../../.';

const { expect } = chai;

describe('"name" option', () => {

    describe('when used with default serializer', () => {

        class Patient {
            @Serialize({ name: 'years' }) public age: number;
            public constructor(age?: number) {
                if (age !== undefined) { this.age = age; }
            }
        }

        it('forces property to use a different name in serialized object', () => {
            const patient = new Patient(35);
            const serialized = deflate(patient);
            expect(serialized).to.deep.equal({ years: 35 });
            const deserialized = inflate(Patient, serialized);
            expect(deserialized).to.deep.equal(patient);
        });

    });

    describe('when used with custom serializer', () => {

        // class Patient {
        //     @Serialize({ name: 'dateOfBirth' }) public birthday: Date;
        //     public constructor(birthday?: Date) {
        //         if (birthday !== undefined) { this.birthday = birthday; }
        //     }
        // }

        it('forces property to use a different name in serialized object', () => {});

    });

});
