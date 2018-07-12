import chai = require('chai');

import { deserialize, Serializable, serialize } from '../..';

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
                const deserialized = deserialize(Patient, serialized);
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
                const deserialized = deserialize(Patient, serialized);
                expect(deserialized).to.deep.equal(patient);
            });

        });

    });

    describe('for "nullable" option', () => {

        describe('when value is null and option is null/undefined/false (default)', () => {

            class Book {
                @Serializable.Prop() public read: boolean;
            }

            it('should fail to serialize', () => {
                const book = Object.assign(new Book(), { read: null });
                expect(() => serialize(book)).to.throw('Unable to serialize property "read": Value is null');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Book, { read: null })).to.throw('Unable to deserialize property "read": Value is null');
            });

        });

        describe('when value is null and option is true', () => {

            class Book {
                @Serializable.Prop({ nullable: true }) public read: boolean;
            }

            it('serializes to null', () => {
                const book = Object.assign(new Book(), { read: null });
                const serialized = serialize(book);
                expect(serialized).to.deep.equal({ read: null });
            });

            it('deserializes to null', () => {
                const deserialized = deserialize(Book, { read: null });
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.deep.equal({ read: null });
            });

        });

    });

    describe('for "optional" option', () => {

        describe('when value is undefined and option is false/null/undefined (default)', () => {

            class Book {
                @Serializable.Prop() public read: boolean;
            }

            it('should fail to serialize', () => {
                const book = new Book();
                expect(() => serialize(book)).to.throw('Unable to serialize property "read": Value is undefined');
            });

            it('should fail to deserialize', () => {
                expect(() => deserialize(Book, {})).to.throw('Unable to deserialize property "read": Value is undefined');
            });

        });

        describe('when value is undefined and option is true', () => {

            class Book {
                @Serializable.Prop({ optional: true }) public read: boolean;
            }

            it('serializes to undefined', () => {
                const book = new Book();
                const serialized = serialize(book);
                expect(serialized).to.not.haveOwnProperty('read');
            });

            it('deserializes to undefined', () => {
                const deserialized = deserialize(Book, {});
                expect(deserialized instanceof Book).to.equal(true);
                expect(deserialized).to.not.haveOwnProperty('read');
            });

        });

    });

});
