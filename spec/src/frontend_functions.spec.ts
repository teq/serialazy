import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

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

            class Foo extends Serializable {
                @Serialize() public id: string;
            }

            const foo = Foo.create({ id: 'foo' });

            expect(deflate(foo)).to.deep.equal({ id: 'foo' });

        });

        it('should fail to serialize non-primitives which are not serializable', () => {

            class Bar extends Serializable {
                public id: string;
            }

            const bar = Bar.create({ id: 'bar' });

            expect(() => deflate(bar)).to.throw('Unable to serialize an instance of "Bar"');

        });

        describe('when used with "as" option', () => {

            @Serialize({ down: (p: PointType1) => `${p.x},${p.y}` })
            class PointType1 extends Serializable {
                public x: number;
                public y: number;
            }

            @Serialize({ down: (p: PointType2) => [p.x, p.y] })
            class PointType2 extends Serializable {
                public x: number;
                public y: number;
            }

            class RectType1 extends Serializable {
                @Serialize() public center: PointType1;
                @Serialize() public width: number;
                @Serialize() public height: number;
            }

            class RectType2 extends Serializable {
                @Serialize() public center: PointType2;
                @Serialize() public width: number;
                @Serialize() public height: number;
            }

            it('allows to override a type of serializable', () => {
                const rect = RectType1.create({
                    center: PointType1.create({ x: 20, y: 15 }),
                    width: 6,
                    height: 3
                });
                expect(deflate(rect)).to.deep.equal({ center: '20,15', width: 6, height: 3 });
                expect(deflate(rect, { as: RectType2 })).to.deep.equal({ center: [20, 15], width: 6, height: 3 });
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
        });

    });

});
