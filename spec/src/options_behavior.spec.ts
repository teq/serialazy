import chai = require('chai');

import { deserialize, Serializable, serialize } from 'serialazy';

const { expect } = chai;

describe('options behavior', () => {

    describe('for "name" option', () => {

        describe('when option is null/undefined/empty (default)', () => {

            class Patient {
                @Serializable.Prop({ name: undefined }) public name: string;
                @Serializable.Prop({ name: null }) public age: number;
                @Serializable.Prop({ name: '' }) public notes : string;
            }

            it('doesn\'t affect property name in resulting serialized object', () => {
                const patient = Object.assign(new Patient(), { name: 'Joe', age: 35, notes: 'None' });
                const serialized = serialize(patient);
                expect(serialized).to.deep.equal({ name: 'Joe', age: 35, notes: 'None' });
                const deserialized = deserialize(serialized, Patient);
                expect(deserialized).to.deep.equal(patient);
            });

        });

        describe('when option is a non-empty string', () => {

            class Patient {
                @Serializable.Prop() public name: string;
                @Serializable.Prop({ name: 'years' }) public age: number;
            }

            it('overrides property name in resulting serialized object', () => {
                const patient = Object.assign(new Patient(), { name: 'John', age: 35 });
                const serialized = serialize(patient);
                expect(serialized).to.deep.equal({ name: 'John', years: 35 });
                const deserialized = deserialize(serialized, Patient);
                expect(deserialized).to.deep.equal(patient);
            });

        });

    });

    describe('for "nullable" option', () => {

        describe('when value is null and option is null/undefined/false (default)', () => {

            class Doctor {
                @Serializable.Prop() public name: string;
            }

            class Patient {
                @Serializable.Prop() public age: number;
                @Serializable.Prop() public doctor: Doctor;
            }

            it('should fail to serialize', () => {

                const doctor = Object.assign(new Doctor(), { name: null });
                expect(
                    () => serialize(doctor)
                ).to.throw('Unable to serialize property "name": Value is null');

                const patient = Object.assign(new Patient(), { age: 35, doctor: null });
                expect(
                    () => serialize(patient)
                ).to.throw('Unable to serialize property "doctor": Value is null');

            });

            it('should fail to deserialize', () => {

                expect(
                    () => deserialize({ name: null }, Doctor)
                ).to.throw('Unable to deserialize property "name": Value is null');

                expect(
                    () => deserialize({ age: 35, doctor: null }, Patient)
                ).to.throw('Unable to deserialize property "doctor": Value is null');

            });

        });

        describe('when value is null and option is true', () => {

            class Doctor {
                @Serializable.Prop({ nullable: true }) public name: string;
            }

            class Patient {
                @Serializable.Prop({ nullable: true }) public age: number;
                @Serializable.Prop({ nullable: true }) public doctor: Doctor;
            }

            it('serializes to null', () => {

                const doctor = Object.assign(new Doctor(), { name: null });
                expect(
                    serialize(doctor)
                ).to.deep.equal({ name: null });

                const patient = Object.assign(new Patient(), { age: 35, doctor: null });
                expect(
                    serialize(patient)
                ).to.deep.equal({ age: 35, doctor: null });

            });

            it('deserializes to null', () => {

                const doctor = deserialize({ name: null }, Doctor);
                expect(doctor).to.be.instanceOf(Doctor);
                expect(doctor).to.deep.equal({ name: null });

                const patient = deserialize({ age: 35, doctor: null }, Patient);
                expect(patient).to.be.instanceOf(Patient);
                expect(patient).to.deep.equal({ age: 35, doctor: null });

            });

        });

    });

    describe('for "optional" option', () => {

        describe('when value is undefined and option is false/null/undefined (default)', () => {

            class Doctor {
                @Serializable.Prop() public name: string;
            }

            class Patient {
                @Serializable.Prop() public age: number;
                @Serializable.Prop() public doctor: Doctor;
            }

            it('should fail to serialize', () => {

                const doctor = new Doctor(); // name is undefined
                expect(
                    () => serialize(doctor)
                ).to.throw('Unable to serialize property "name": Value is undefined');

                const patient = Object.assign(new Patient(), { age: 35 }); // doctor is undefined
                expect(
                    () => serialize(patient)
                ).to.throw('Unable to serialize property "doctor": Value is undefined');

            });

            it('should fail to deserialize', () => {

                const doctorObj = {}; // name is undefined
                expect(
                    () => deserialize(doctorObj, Doctor)
                ).to.throw('Unable to deserialize property "name": Value is undefined');

                const patientObj = { age: 35 }; // doctor is undefined
                expect(
                    () => deserialize(patientObj, Patient)
                ).to.throw('Unable to deserialize property "doctor": Value is undefined');

            });

        });

        describe('when value is undefined and option is true', () => {

            class Doctor {
                @Serializable.Prop({ optional: true }) public name: string;
            }

            class Patient {
                @Serializable.Prop({ optional: true }) public age: number;
                @Serializable.Prop({ optional: true }) public doctor: Doctor;
            }

            it('serializes to undefined', () => {

                const doctor = new Doctor(); // name is undefined
                expect(
                    serialize(doctor)
                ).to.deep.equal({}); // name is not serialized

                const patient = Object.assign(new Patient(), { age: 35 }); // doctor is undefined
                expect(
                    serialize(patient)
                ).to.deep.equal({ age: 35 }); // doctor is not serialized

            });

            it('deserializes to undefined', () => {

                const doctor = deserialize({}, Doctor); // name is undefined
                expect(doctor).to.be.instanceOf(Doctor);
                expect(doctor).to.deep.equal({});

                const patient = deserialize({ age: 35 }, Patient); // doctor is undefined
                expect(patient).to.be.instanceOf(Patient);
                expect(patient).to.deep.equal({ age: 35 });

            });

        });

    });

});
