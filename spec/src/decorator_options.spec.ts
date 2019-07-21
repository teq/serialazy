import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

const { expect } = chai;

describe('decorator options', () => {

    describe('"projection" option', () => {

        describe('when option is empty/null/undefined (default)', () => {

            it('applies decorator in "default" projection');

        });

        describe('when option is a non-empty string', () => {

            it('applies decorator in given projection');

        });

    });

    describe('"name" option', () => {

        describe('when option is empty/null/undefined (default)', () => {

            class Patient {
                @Serialize({ name: undefined }) public name: string;
                @Serialize({ name: null }) public age: number;
                @Serialize({ name: '' }) public notes : string;
            }

            it('doesn\'t affect property name in resulting serialized object', () => {
                const patient = Object.assign(new Patient(), { name: 'Joe', age: 35, notes: 'None' });
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
            }

            it('overrides property name in resulting serialized object', () => {
                const patient = Object.assign(new Patient(), { name: 'John', age: 35 });
                const serialized = deflate(patient);
                expect(serialized).to.deep.equal({ name: 'John', years: 35 });
                const deserialized = inflate(Patient, serialized);
                expect(deserialized).to.deep.equal(patient);
            });

            it('should be impossible to use the same name for multiple properties');

        });

    });

    describe('"nullable" option', () => {

        describe('when value is null and option is false/undefined (default)', () => {

            class Doctor {
                @Serialize() public name: string;
            }

            class Patient {
                @Serialize() public age: number;
                @Serialize({ nullable: false }) public doctor: Doctor;
            }

            it('should fail to serialize', () => {

                const doctor = Object.assign(new Doctor(), { name: null });
                expect(
                    () => deflate(doctor)
                ).to.throw('Unable to serialize property "name": Value is null');

                const patient = Object.assign(new Patient(), { age: 35, doctor: null });
                expect(
                    () => deflate(patient)
                ).to.throw('Unable to serialize property "doctor": Value is null');

            });

            it('should fail to deserialize', () => {

                expect(
                    () => inflate(Doctor, { name: null })
                ).to.throw('Unable to deserialize property "name": Value is null');

                expect(
                    () => inflate(Patient, { age: 35, doctor: null })
                ).to.throw('Unable to deserialize property "doctor": Value is null');

            });

        });

        describe('when value is null and option is true', () => {

            class Doctor {
                @Serialize({ nullable: true }) public name: string;
            }

            class Patient {
                @Serialize({ nullable: true }) public age: number;
                @Serialize({ nullable: true }) public doctor: Doctor;
            }

            it('serializes to null', () => {

                const doctor = Object.assign(new Doctor(), { name: null });
                expect(
                    deflate(doctor)
                ).to.deep.equal({ name: null });

                const patient = Object.assign(new Patient(), { age: 35, doctor: null });
                expect(
                    deflate(patient)
                ).to.deep.equal({ age: 35, doctor: null });

            });

            it('deserializes to null', () => {

                const doctor = inflate(Doctor, { name: null });
                expect(doctor).to.be.instanceOf(Doctor);
                expect(doctor).to.deep.equal({ name: null });

                const patient = inflate(Patient, { age: 35, doctor: null });
                expect(patient).to.be.instanceOf(Patient);
                expect(patient).to.deep.equal({ age: 35, doctor: null });

            });

        });

    });

    describe('"optional" option', () => {

        describe('when value is undefined and option is false/undefined (default)', () => {

            class Doctor {
                @Serialize() public name: string;
            }

            class Patient {
                @Serialize() public age: number;
                @Serialize({ optional: false }) public doctor: Doctor;
            }

            it('should fail to serialize', () => {

                const doctor = new Doctor(); // name is undefined
                expect(
                    () => deflate(doctor)
                ).to.throw('Unable to serialize property "name": Value is undefined');

                const patient = Object.assign(new Patient(), { age: 35 }); // doctor is undefined
                expect(
                    () => deflate(patient)
                ).to.throw('Unable to serialize property "doctor": Value is undefined');

            });

            it('should fail to deserialize', () => {

                const doctorObj = {}; // name is undefined
                expect(
                    () => inflate(Doctor, doctorObj)
                ).to.throw('Unable to deserialize property "name": Value is undefined');

                const patientObj = { age: 35 }; // doctor is undefined
                expect(
                    () => inflate(Patient, patientObj)
                ).to.throw('Unable to deserialize property "doctor": Value is undefined');

            });

        });

        describe('when value is undefined and option is true', () => {

            class Doctor {
                @Serialize({ optional: true }) public name: string;
            }

            class Patient {
                @Serialize({ optional: true }) public age: number;
                @Serialize({ optional: true }) public doctor: Doctor;
            }

            it('serializes to undefined', () => {

                const doctor = new Doctor(); // name is undefined
                expect(
                    deflate(doctor)
                ).to.deep.equal({}); // name is not serialized

                const patient = Object.assign(new Patient(), { age: 35 }); // doctor is undefined
                expect(
                    deflate(patient)
                ).to.deep.equal({ age: 35 }); // doctor is not serialized

            });

            it('deserializes to undefined', () => {

                const doctor = inflate(Doctor, {}); // name is undefined
                expect(doctor).to.be.instanceOf(Doctor);
                expect(doctor).to.deep.equal({});

                const patient = inflate(Patient, { age: 35 }); // doctor is undefined
                expect(patient).to.be.instanceOf(Patient);
                expect(patient).to.deep.equal({ age: 35 });

            });

        });

    });

});
