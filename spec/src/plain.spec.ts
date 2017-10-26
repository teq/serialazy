import chai = require('chai');

import Jsonify from '../../.';

const { expect } = chai;

describe('plain object serialization', () => {

    it('should fail to serialize a class instance which is not marked for serialization', () => {
        class Dummy {}
        const dummy = new Dummy();
        expect(() => Jsonify.toJsonObject(dummy)).to.throw("Provided type doesn't seem to be serializable");
    });

    it('uses original class property name in serialized object by default');

    describe('property mapping overrides', () => {});

});
