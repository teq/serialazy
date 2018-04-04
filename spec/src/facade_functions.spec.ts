import chai = require('chai');

import { deflate } from './@lib/serialazy';

const { expect } = chai;

describe('facade functions', () => {

    it('should fail to serialize a class instance which is not serializable', () => {
        class Dummy {}
        const dummy = new Dummy();
        expect(() => deflate(dummy)).to.throw("Value is not serializable");
    });

});
