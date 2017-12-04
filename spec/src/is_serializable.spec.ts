import chai = require('chai');

import { isSerializable, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('"isSerializable" function', () => {

    it('throws if argument is null/undefined', () => {
        const errMessage = 'Expecting `target` to be not null/undefined';
        expect(() => isSerializable(null)).to.throw(errMessage);
        expect(() => isSerializable(undefined)).to.throw(errMessage);
    });

    it('returns true if argument is serializable', () => {
        class Book { @Serialize() public title: string; }
        expect(isSerializable(new Book())).to.equal(true);
    });

    it('returns false if argument is not serializable', () => {
        class Test {}
        expect(isSerializable(new Test())).to.equal(false);
        expect(isSerializable(123)).to.equal(false);
        expect(isSerializable('test')).to.equal(false);
    });

});
