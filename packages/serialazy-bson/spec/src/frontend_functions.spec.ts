import chai = require('chai');

import {
    deflate,
    deflateToBinary,
    inflate,
    inflateFromBinary,
    Serialize
} from 'serialazy-bson';

const { expect } = chai;

describe('frontend functions', () => {

    describe('deflate', () => {
        it('is able to serialize null/undefined', () => {
            expect(deflate(null)).to.equal(null);
            expect(deflate(undefined)).to.equal(undefined);
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
            expect(inflate(Date, null)).to.equal(null);
            expect(inflate(Date, undefined)).to.equal(undefined);
            expect(inflate(RegExp as any, null)).to.equal(null);
            expect(inflate(RegExp as any, undefined)).to.equal(undefined);
        });
    });

    describe('deflateToBinary', () => {
        it('is able to serialize null/undefined', () => {
            expect(deflateToBinary(null)).to.equal(null);
            expect(deflateToBinary(undefined)).to.equal(undefined);
        });
    });

    describe('inflateFromBinary', () => {
        it('is able to deserialize null/undefined', () => {
            expect(inflateFromBinary(Boolean, null)).to.equal(null);
            expect(inflateFromBinary(Boolean, undefined)).to.equal(undefined);
            expect(inflateFromBinary(Number, null)).to.equal(null);
            expect(inflateFromBinary(Number, undefined)).to.equal(undefined);
            expect(inflateFromBinary(String, null)).to.equal(null);
            expect(inflateFromBinary(String, undefined)).to.equal(undefined);
            expect(inflateFromBinary(Date, null)).to.equal(null);
            expect(inflateFromBinary(Date, undefined)).to.equal(undefined);
            expect(inflateFromBinary(RegExp as any, null)).to.equal(null);
            expect(inflateFromBinary(RegExp as any, undefined)).to.equal(undefined);
        });
    });

});
