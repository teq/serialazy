import chai = require('chai');

import { deserialize, Serializable, serialize } from './@lib/serialazy';

const { expect } = chai;

describe('options behavior', () => {

    describe('for "name" option', () => {

        describe('when option is null/undefined/empty (default)', () => {

            class Patient {
                @Serializable.Prop({ name: undefined }) public name: string;
                @Serializable.Prop({ name: null }) public age: number;
                @Serializable.Prop({ name: '' }) public notes : string;
                public constructor(name?: string, age?: number, notes?: string) {
                    if (name !== undefined) { this.name = name; }
                    if (age !== undefined) { this.age = age; }
                    if (notes !== undefined) { this.notes = notes; }
                }
            }

            it('doesn\'t affect property name in resulting serialized object', () => {
                const patient = new Patient('Joe', 35, 'None');
                const serialized = serialize(patient);
                expect(serialized).to.deep.equal({ name: 'Joe', age: 35, notes: 'None' });
                const deserialized = deserialize(Patient, serialized);
                expect(deserialized).to.deep.equal(patient);
            });

        });

        describe('when option is a non-empty string', () => {

            class Patient {
                @Serializable.Prop() public name: string;
                @Serializable.Prop({ name: 'years' }) public age: number;
                public constructor(name?: string, age?: number) {
                    if (name !== undefined) { this.name = name; }
                    if (age !== undefined) { this.age = age; }
                }
            }

            it('overrides property name in resulting serialized object', () => {
                const patient = new Patient('John', 35);
                const serialized = serialize(patient);
                expect(serialized).to.deep.equal({ name: 'John', years: 35 });
                const deserialized = deserialize(Patient, serialized);
                expect(deserialized).to.deep.equal(patient);
            });

        });

    });

    describe('for "nullable" option', () => {

        describe('when value is null and option is null/undefined/false (default)', () => {

            class Patient {
                @Serializable.Prop() public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('should fail to serialize', () => {
                const patient = new Patient(null);
                expect(() => serialize(patient)).to.throw('Unable to serialize property "married": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Patient, { married: null })).to.throw('Unable to deserialize property "married": Value is null');
            });

        });

        describe('when value is null and option is true', () => {

            class Patient {
                @Serializable.Prop({ nullable: true }) public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('serializes to null', () => {
                const patient = new Patient(null);
                const serialized = serialize(patient);
                expect(serialized).to.deep.equal({ married: null });
            });

            it('deserializes to null', () => {
                const deserialized = deserialize(Patient, { married: null });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.deep.equal({ married: null });
            });

        });

    });

    describe('for "optional" option', () => {

        describe('when value is undefined and option is false/null/undefined (default)', () => {

            class Patient {
                @Serializable.Prop() public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('should fail to serialize', () => {
                const patient = new Patient(undefined);
                expect(() => serialize(patient)).to.throw('Unable to serialize property "married": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Patient, { married: undefined })).to.throw('Unable to deserialize property "married": Value is undefined');
            });

        });

        describe('when value is undefined and option is true', () => {

            class Patient {
                @Serializable.Prop({ optional: true }) public married: boolean;
                public constructor(married?: boolean) {
                    if (married !== undefined) { this.married = married; }
                }
            }

            it('serializes to undefined', () => {
                const patient = new Patient(undefined);
                const serialized = serialize(patient);
                expect(serialized).to.not.haveOwnProperty('married');
            });

            it('deserializes to undefined', () => {
                const deserialized = deserialize(Patient, { married: undefined });
                expect(deserialized instanceof Patient).to.equal(true);
                expect(deserialized).to.not.haveOwnProperty('married');
            });

        });

    });

});
