import chai = require('chai');

import { Constructor, deflate, inflate, Serialize } from 'serialazy';

const { expect } = chai;

describe('frontend functions', () => {

    describe('deflate', () => {

        it('is able to serialize null/undefined', () => {
            expect(deflate(null)).to.equal(null);
            expect(deflate(undefined)).to.equal(undefined);
        });

        it('is able to serialize primitives', () => {

            expect(deflate(true)).to.be.a('boolean');
            expect(deflate(new Boolean(true))).to.be.a('boolean');
            expect(deflate(true)).to.equal(true);
            expect(deflate(new Boolean(true))).to.equal(true);

            expect(deflate(12)).to.be.a('number');
            expect(deflate(new Number(12))).to.be.a('number');
            expect(deflate(12)).to.equal(12);
            expect(deflate(new Number(12))).to.equal(12);

            expect(deflate('hello')).to.be.a('string');
            expect(deflate(new String('hello'))).to.be.a('string');
            expect(deflate('hello')).to.equal('hello');
            expect(deflate(new String('hello'))).to.equal('hello');

        });

        it('is able to serialize non-primitives which are serializable', () => {
            class Foo { @Serialize() public id: string; }
            const foo = Object.assign(new Foo(), { id: 'foo' });
            expect(deflate(foo)).to.deep.equal({ id: 'foo' });
        });

        it('should fail to serialize non-primitives which are not serializable', () => {
            class Bar { public id: string; }
            const bar = Object.assign(new Bar(), { id: 'bar' });
            expect(() => deflate(bar)).to.throw("Unable to serialize a value");
        });

        describe('when used with options', () => {

            describe('"as" option', () => {

                @Serialize({ down: (p: PointType1) => `${p.x},${p.y}` })
                class PointType1 {
                    public x: number;
                    public y: number;
                }

                @Serialize({ down: (p: PointType2) => [p.x, p.y] })
                class PointType2 {
                    public x: number;
                    public y: number;
                }

                class RectType1 {
                    @Serialize() public center: PointType1;
                    @Serialize() public width: number;
                    @Serialize() public height: number;
                }

                class RectType2 {
                    @Serialize() public center: PointType2;
                    @Serialize() public width: number;
                    @Serialize() public height: number;
                }

                it('allows to override a type of serializable', () => {
                    const rect = Object.assign(new RectType1(), {
                        center: Object.assign(new PointType1(), { x: 20, y: 15 }),
                        width: 6,
                        height: 3
                    });
                    expect(deflate(rect)).to.deep.equal({ center: '20,15', width: 6, height: 3 });
                    expect(deflate(rect, { as: RectType2 })).to.deep.equal({ center: [20, 15], width: 6, height: 3 });
                });

            });

            describe('"projection" option', () => {

                class Person {
                    @Serialize()
                    @Serialize({ projection: 'foo', name: 'years' })
                    public age: number;
                }

                const personObj = { age: 47 };
                const defaultProjection = personObj;
                const fooProjection = { years: 47 };

                function itSerializesInDefaultProjection(ctor: Constructor<{age: number}>, options: { projection?: string }) {
                    it('performs serialization in "default" projection', () => {
                        const person = Object.assign(new ctor(), personObj);
                        expect(deflate(person, options)).to.deep.equal(defaultProjection);
                    });
                }

                describe('when option is undefined', () => {
                    itSerializesInDefaultProjection(Person, {});
                });

                describe('when option is set to undefined', () => {
                    itSerializesInDefaultProjection(Person, { projection: undefined });
                });

                describe('when option is set to null', () => {
                    itSerializesInDefaultProjection(Person, { projection: null });
                });

                describe('when option is set to empty string', () => {
                    itSerializesInDefaultProjection(Person, { projection: '' });
                });

                describe('when option is a non-empty string', () => {
                    it('performs serialization in given projection', () => {
                        const person = Object.assign(new Person(), personObj);
                        expect(deflate(person, { projection: 'foo' })).to.deep.equal(fooProjection);
                    });
                });

            });

        });

    });

    describe('inflate', () => {

        it('is able to deserialize primitives', () => {

            expect(inflate(Boolean, true)).to.be.a('boolean');
            expect(inflate(Boolean, new Boolean(true) as boolean)).to.be.a('boolean');
            expect(inflate(Boolean, true)).to.equal(true);
            expect(inflate(Boolean, new Boolean(true) as boolean)).to.equal(true);

            expect(inflate(Number, 12)).to.be.a('number');
            expect(inflate(Number, new Number(12) as number)).to.be.a('number');
            expect(inflate(Number, 12)).to.equal(12);
            expect(inflate(Number, new Number(12) as number)).to.equal(12);

            expect(inflate(String, 'hello')).to.be.a('string');
            expect(inflate(String, new String('hello') as string)).to.be.a('string');
            expect(inflate(String, 'hello')).to.equal('hello');
            expect(inflate(String, new String('hello') as string)).to.equal('hello');

        });

        it('is able to deserialize non-primitives which are serializable', () => {
            class Foo { @Serialize() public id: string; }
            const foo = inflate(Foo, { id: 'foo' });
            expect(foo).to.be.instanceOf(Foo);
            expect(foo).to.deep.equal({ id: 'foo' });
        });

        it('should fail to deserialize non-primitives which are not serializable', () => {
            class Bar { public id: string; }
            expect(() => inflate(Bar, { id: 'bar' })).to.throw('Unable to deserialize an instance of "Bar"');
        });

        describe('when used with options', () => {

            describe('"projection" option', () => {

                class Person {
                    @Serialize()
                    @Serialize({ projection: 'foo', name: 'years' })
                    public age: number;
                }

                const personObj = { age: 47 };
                const defaultProjection = personObj;
                const fooProjection = { years: 47 };

                function itDeserializesInDefaultProjection(ctor: Constructor<{age: number}>, options: { projection?: string }) {
                    it('performs deserialization in "default" projection', () => {
                        expect(inflate(ctor, defaultProjection, options)).to.deep.equal(personObj);
                        expect(
                            () => inflate(Person, fooProjection, options)
                        ).to.throw('Unable to deserialize property "age": Value is undefined');
                    });
                }

                describe('when option is undefined', () => {
                    itDeserializesInDefaultProjection(Person, {});
                });

                describe('when option is set to undefined', () => {
                    itDeserializesInDefaultProjection(Person, { projection: undefined });
                });

                describe('when option is set to null', () => {
                    itDeserializesInDefaultProjection(Person, { projection: null });
                });

                describe('when option is set to empty string', () => {
                    itDeserializesInDefaultProjection(Person, { projection: '' });
                });

                describe('when option is a non-empty string', () => {
                    it('performs deserialization in given projection', () => {
                        expect(inflate(Person, fooProjection, { projection: 'foo' })).to.deep.equal(personObj);
                        expect(
                            () => inflate(Person, defaultProjection, { projection: 'foo' })
                        ).to.throw('Unable to deserialize property "age" (mapped to "years"): Value is undefined');
                    });
                });

            });

        });

    });

});
