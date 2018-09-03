import chai = require('chai');

import { deserialize, Serializable, serialize } from 'serialazy';

const { expect } = chai;

describe('facade function', () => {

    class Foo {
        @Serializable.Prop() public id: string;
    }

    class Bar {
        public id: string;
    }

    @Serializable.Type({ down: (p: PointType1) => `${p.x},${p.y}` })
    class PointType1 {
        public x: number;
        public y: number;
    }

    @Serializable.Type({ down: (p: PointType2) => [p.x, p.y] })
    class PointType2 {
        public x: number;
        public y: number;
    }

    class RectType1 {
        @Serializable.Prop() public center: PointType1;
        @Serializable.Prop() public width: number;
        @Serializable.Prop() public height: number;
    }

    class RectType2 {
        @Serializable.Prop() public center: PointType2;
        @Serializable.Prop() public width: number;
        @Serializable.Prop() public height: number;
    }

    describe('serialize', () => {

        it('is able to serialize null/undefined', () => {
            expect(serialize(null)).to.equal(null);
            expect(serialize(undefined)).to.equal(undefined);
        });

        it('is able to serialize primitives', () => {

            expect(serialize(true)).to.be.a('boolean');
            expect(serialize(new Boolean(true))).to.be.a('boolean');
            expect(serialize(true)).to.equal(true);
            expect(serialize(new Boolean(true))).to.equal(true);

            expect(serialize(12)).to.be.a('number');
            expect(serialize(new Number(12))).to.be.a('number');
            expect(serialize(12)).to.equal(12);
            expect(serialize(new Number(12))).to.equal(12);

            expect(serialize('hello')).to.be.a('string');
            expect(serialize(new String('hello'))).to.be.a('string');
            expect(serialize('hello')).to.equal('hello');
            expect(serialize(new String('hello'))).to.equal('hello');

        });

        it('is able to serialize non-primitives which are serializable', () => {
            const foo = Object.assign(new Foo(), { id: 'foo' });
            expect(serialize(foo)).to.deep.equal({ id: 'foo' });
        });

        it('should fail to serialize non-primitives which are not serializable', () => {
            const bar = Object.assign(new Bar(), { id: 'bar' });
            expect(() => serialize(bar)).to.throw("Unable to serialize a value");
        });

        it('allows to override a type of serializable', () => {
            const rect = Object.assign(new RectType1(), {
                center: Object.assign(new PointType1(), { x: 20, y: 15 }),
                width: 6,
                height: 3
            });
            expect(serialize(rect)).to.deep.equal({ center: '20,15', width: 6, height: 3 });
            expect(serialize(rect, RectType2)).to.deep.equal({ center: [20, 15], width: 6, height: 3 });
        });

    });

    describe('deserialize', () => {

        it('is able to deserialize primitives', () => {

            expect(deserialize(true, Boolean)).to.be.a('boolean');
            expect(deserialize(new Boolean(true) as boolean, Boolean)).to.be.a('boolean');
            expect(deserialize(true, Boolean)).to.equal(true);
            expect(deserialize(new Boolean(true) as boolean, Boolean)).to.equal(true);

            expect(deserialize(12, Number)).to.be.a('number');
            expect(deserialize(new Number(12) as number, Number)).to.be.a('number');
            expect(deserialize(12, Number)).to.equal(12);
            expect(deserialize(new Number(12) as number, Number)).to.equal(12);

            expect(deserialize('hello', String)).to.be.a('string');
            expect(deserialize(new String('hello') as string, String)).to.be.a('string');
            expect(deserialize('hello', String)).to.equal('hello');
            expect(deserialize(new String('hello') as string, String)).to.equal('hello');

        });

        it('is able to deserialize non-primitives which are serializable', () => {
            const foo = deserialize({ id: 'foo' }, Foo);
            expect(foo).to.be.instanceOf(Foo);
            expect(foo).to.deep.equal({ id: 'foo' });
        });

        it('should fail to deserialize non-primitives which are not serializable', () => {
            expect(() => deserialize({ id: 'bar' }, Bar)).to.throw('Unable to deserialize an instance of "Bar"');
        });

    });

});
