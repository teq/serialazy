import chai = require('chai');

import { isSerializable, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('"isSerializable" function', () => {

    it('returns false for undefined value', () => {
        expect(isSerializable(undefined)).to.equal(false);
    });

    it('returns true for null value', () => {
        expect(isSerializable(null)).to.equal(true);
    });

    describe('when target is a constructor function', () => {

        it('returns true for primitive types', () => {
            expect(isSerializable(Boolean)).to.equal(true);
            expect(isSerializable(Number)).to.equal(true);
            expect(isSerializable(String)).to.equal(true);
        });

        it('returns true for non-primitive serializable types', () => {
            class Book {
                @Serialize() public title: string;
            }
            expect(isSerializable(Book)).to.equal(true);
        });

        it('returns false for other values', () => {
            class Book {
                public title: string;
            }
            expect(isSerializable(Book)).to.equal(false);
            expect(isSerializable(RegExp)).to.equal(false);
            expect(isSerializable(Function)).to.equal(false);
            expect(isSerializable(Date)).to.equal(false);
        });

    });

    describe('when target is value (instance)', () => {

        it('returns true for primitive types', () => {
            expect(isSerializable(false)).to.equal(true);
            expect(isSerializable(new Boolean(false))).to.equal(true);
            expect(isSerializable(123)).to.equal(true);
            expect(isSerializable(new Number(123))).to.equal(true);
            expect(isSerializable('test')).to.equal(true);
            expect(isSerializable(new String('test'))).to.equal(true);
        });

        it('returns true for non-primitive serializable types', () => {
            class Book {
                @Serialize() public title: string;
            }
            expect(isSerializable(new Book())).to.equal(true);
        });

        it('returns false for other values', () => {
            class Book {
                public title: string;
            }
            expect(isSerializable(new Book())).to.equal(false);
            expect(isSerializable(new RegExp(''))).to.equal(false);
            expect(isSerializable(() => {})).to.equal(false);
            expect(isSerializable(new Date())).to.equal(false);
        });

    });

});
