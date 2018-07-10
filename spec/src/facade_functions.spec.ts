import chai = require('chai');

import { deserialize, Serializable, serialize } from '../..';

const { expect } = chai;

describe('facade function', () => {

    class Foo {
        @Serializable.Prop() public id: string;
    }

    class Bar {
        public id: string;
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

    });

    describe('deserialize', () => {

        it('is able to deserialize primitives', () => {

            expect(deserialize(Boolean, true)).to.be.a('boolean');
            expect(deserialize(Boolean, new Boolean(true) as boolean)).to.be.a('boolean');
            expect(deserialize(Boolean, true)).to.equal(true);
            expect(deserialize(Boolean, new Boolean(true) as boolean)).to.equal(true);

            expect(deserialize(Number, 12)).to.be.a('number');
            expect(deserialize(Number, new Number(12) as number)).to.be.a('number');
            expect(deserialize(Number, 12)).to.equal(12);
            expect(deserialize(Number, new Number(12) as number)).to.equal(12);

            expect(deserialize(String, 'hello')).to.be.a('string');
            expect(deserialize(String, new String('hello') as string)).to.be.a('string');
            expect(deserialize(String, 'hello')).to.equal('hello');
            expect(deserialize(String, new String('hello') as string)).to.equal('hello');

        });

        it('is able to deserialize non-primitives which are serializable', () => {
            const foo = deserialize(Foo, { id: 'foo' });
            expect(foo).to.be.instanceOf(Foo);
            expect(foo).to.deep.equal({ id: 'foo' });
        });

        it('should fail to deserialize non-primitives which are not serializable', () => {
            expect(() => deserialize(Bar, { id: 'bar' })).to.throw('Unable to deserialize an instance of "Bar"');
        });

    });

});
