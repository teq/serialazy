import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

const { expect } = chai;

describe('facade function', () => {

    class Foo {
        @Serialize() public id: string;
    }

    class Bar {
        public id: string;
    }

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

    describe('deflate function', () => {

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
            const foo = Object.assign(new Foo(), { id: 'foo' });
            expect(deflate(foo)).to.deep.equal({ id: 'foo' });
        });

        it('should fail to serialize non-primitives which are not serializable', () => {
            const bar = Object.assign(new Bar(), { id: 'bar' });
            expect(() => deflate(bar)).to.throw("Unable to serialize a value");
        });

        it('allows to override a type of serializable', () => {
            const rect = Object.assign(new RectType1(), {
                center: Object.assign(new PointType1(), { x: 20, y: 15 }),
                width: 6,
                height: 3
            });
            expect(deflate(rect)).to.deep.equal({ center: '20,15', width: 6, height: 3 });
            expect(deflate(rect, RectType2)).to.deep.equal({ center: [20, 15], width: 6, height: 3 });
        });

    });

    describe('inflate function', () => {

        it('is able to deserialize primitives', () => {

            expect(inflate(true, Boolean)).to.be.a('boolean');
            expect(inflate(new Boolean(true) as boolean, Boolean)).to.be.a('boolean');
            expect(inflate(true, Boolean)).to.equal(true);
            expect(inflate(new Boolean(true) as boolean, Boolean)).to.equal(true);

            expect(inflate(12, Number)).to.be.a('number');
            expect(inflate(new Number(12) as number, Number)).to.be.a('number');
            expect(inflate(12, Number)).to.equal(12);
            expect(inflate(new Number(12) as number, Number)).to.equal(12);

            expect(inflate('hello', String)).to.be.a('string');
            expect(inflate(new String('hello') as string, String)).to.be.a('string');
            expect(inflate('hello', String)).to.equal('hello');
            expect(inflate(new String('hello') as string, String)).to.equal('hello');

        });

        it('is able to deserialize non-primitives which are serializable', () => {
            const foo = inflate({ id: 'foo' }, Foo);
            expect(foo).to.be.instanceOf(Foo);
            expect(foo).to.deep.equal({ id: 'foo' });
        });

        it('should fail to deserialize non-primitives which are not serializable', () => {
            expect(() => inflate({ id: 'bar' }, Bar)).to.throw('Unable to deserialize an instance of "Bar"');
        });

    });

});
