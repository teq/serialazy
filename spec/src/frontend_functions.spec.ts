import chai = require('chai');

import { deflate, inflate, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

describe('frontend functions', () => {

    class Foo extends Serializable {
        @Serialize()
        public id: string;
    }

    class Bar extends Serializable {
        public id: string;
    }

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
            const foo = Foo.create({ id: 'foo' });
            expect(deflate(foo)).to.deep.equal({ id: 'foo' });
        });

        it('should fail to serialize non-primitives which are not serializable', () => {
            const bar = Bar.create({ id: 'bar' });
            expect(() => deflate(bar)).to.throw('Unable to serialize an instance of "Bar"');
        });

    });

    describe('inflate', () => {

        it('is able to deserialize null/undefined', () => {
            expect(inflate(Boolean, null)).to.equal(null);
            expect(inflate(Boolean, undefined)).to.equal(undefined);
            expect(inflate(Number, null)).to.equal(null);
            expect(inflate(Number, undefined)).to.equal(undefined);
            expect(inflate(String, null)).to.equal(null);
            expect(inflate(String, undefined)).to.equal(undefined);
            expect(inflate(Foo, null)).to.equal(null);
            expect(inflate(Foo, undefined)).to.equal(undefined);
        });

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
            const foo = inflate(Foo, { id: 'foo' });
            expect(foo).to.be.instanceOf(Foo);
            expect(foo).to.deep.equal({ id: 'foo' });
        });

        it('should fail to deserialize non-primitives which are not serializable', () => {
            expect(() => inflate(Bar, { id: 'bar' })).to.throw('Unable to deserialize an instance of "Bar"');
        });

    });

});
