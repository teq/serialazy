import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('decorator options', () => {

    describe('"name" option', () => {

        describe('when option is empty/null/undefined (default)', () => {

            class Person extends Serializable {
                @Serialize({ name: undefined }) public name: string;
                @Serialize({ name: null }) public age: number;
                @Serialize({ name: '' }) public notes : string;
            }

            it('doesn\'t affect property name in resulting serialized object', () => {
                const person = Person.create({ name: 'Joe', age: 35, notes: 'None' });
                const serialized = deflate(person);
                expect(serialized).to.deep.equal({ name: 'Joe', age: 35, notes: 'None' });
                const deserialized = inflate(Person, serialized);
                expect(deserialized).to.deep.equal(person);
            });

        });

        describe('when option is a non-empty string', () => {

            class Person extends Serializable {
                @Serialize() public name: string;
                @Serialize({ name: 'years' }) public age: number;
            }

            it('overrides property name in resulting serialized object', () => {
                const person = Person.create({ name: 'John', age: 35 });
                const serialized = deflate(person);
                expect(serialized).to.deep.equal({ name: 'John', years: 35 });
                const deserialized = inflate(Person, serialized);
                expect(deserialized).to.deep.equal(person);
            });

            it('should be impossible to use the same name for multiple properties', () => {
                [
                    () => {
                        class Person {
                            @Serialize() public age: number;
                            @Serialize({ name: 'age' }) public years: number;
                        }
                    },
                    () => {
                        class Person {
                            @Serialize({ name: 'age' }) public foo: number;
                            @Serialize({ name: 'age' }) public bar: number;
                        }
                    }
                ].forEach(func => expect(func).to.throw('"age" tag already used'));
            });

        });

    });

    describe('"nullable" option', () => {

        describe('when value is null and option is false/undefined (default)', () => {

            class Pet extends Serializable {
                @Serialize() public name: string;
            }

            class Person extends Serializable {
                @Serialize() public age: number;
                @Serialize({ nullable: false }) public pet: Pet;
            }

            it('should fail to serialize', () => {

                const pet = Pet.create({ name: null });
                expect(
                    () => deflate(pet)
                ).to.throw('Unable to serialize property "name": Value is null');

                const person = Person.create({ age: 35, pet: null });
                expect(
                    () => deflate(person)
                ).to.throw('Unable to serialize property "pet": Value is null');

            });

            it('should fail to deserialize', () => {

                expect(
                    () => inflate(Pet, { name: null })
                ).to.throw('Unable to deserialize property "name": Value is null');

                expect(
                    () => inflate(Person, { age: 35, pet: null })
                ).to.throw('Unable to deserialize property "pet": Value is null');

            });

        });

        describe('when value is null and option is true', () => {

            class Pet extends Serializable {
                @Serialize({ nullable: true }) public name: string;
            }

            class Person extends Serializable {
                @Serialize({ nullable: true }) public age: number;
                @Serialize({ nullable: true }) public pet: Pet;
            }

            it('serializes to null', () => {

                const pet = Pet.create({ name: null });
                expect(
                    deflate(pet)
                ).to.deep.equal({ name: null });

                const person = Person.create({ age: 35, pet: null });
                expect(
                    deflate(person)
                ).to.deep.equal({ age: 35, pet: null });

            });

            it('deserializes to null', () => {

                const pet = inflate(Pet, { name: null });
                expect(pet).to.be.instanceOf(Pet);
                expect(pet).to.deep.equal({ name: null });

                const person = inflate(Person, { age: 35, pet: null });
                expect(person).to.be.instanceOf(Person);
                expect(person).to.deep.equal({ age: 35, pet: null });

            });

        });

    });

    describe('"optional" option', () => {

        describe('when value is undefined and option is false/undefined (default)', () => {

            class Pet extends Serializable {
                @Serialize() public name: string;
            }

            class Person extends Serializable {
                @Serialize() public age: number;
                @Serialize({ optional: false }) public pet: Pet;
            }

            it('should fail to serialize', () => {

                const pet = new Pet(); // name is undefined
                expect(
                    () => deflate(pet)
                ).to.throw('Unable to serialize property "name": Value is undefined');

                const person = Person.create({ age: 35, pet: undefined });
                expect(
                    () => deflate(person)
                ).to.throw('Unable to serialize property "pet": Value is undefined');

            });

            it('should fail to deserialize', () => {

                const petObj = {}; // name is undefined
                expect(
                    () => inflate(Pet, petObj)
                ).to.throw('Unable to deserialize property "name": Value is undefined');

                const personObj = { age: 35 }; // pet is undefined
                expect(
                    () => inflate(Person, personObj)
                ).to.throw('Unable to deserialize property "pet": Value is undefined');

            });

        });

        describe('when value is undefined and option is true', () => {

            class Pet extends Serializable {
                @Serialize({ optional: true }) public name: string;
            }

            class Person extends Serializable {
                @Serialize({ optional: true }) public age: number;
                @Serialize({ optional: true }) public pet: Pet;
            }

            it('serializes to undefined', () => {

                const pet = new Pet(); // name is undefined
                expect(
                    deflate(pet)
                ).to.deep.equal({}); // name is not serialized

                const person = Person.create({ age: 35, pet: undefined });
                expect(
                    deflate(person)
                ).to.deep.equal({ age: 35 }); // pet is not serialized

            });

            it('deserializes to undefined', () => {

                const pet = inflate(Pet, {}); // name is undefined
                expect(pet).to.be.instanceOf(Pet);
                expect(pet).to.deep.equal({});

                const person = inflate(Person, { age: 35 }); // pet is undefined
                expect(person).to.be.instanceOf(Person);
                expect(person).to.deep.equal({ age: 35 });

            });

        });

    });

});
