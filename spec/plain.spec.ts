import chai = require('chai');

import Serializer from '../src/serializer';

const { expect } = chai;

describe('plain object serialization', () => {

    it('should fail to serialize a class instance which is not marked for serialization', () => {
        class Dummy {}
        const dummy = new Dummy();
        expect(() => Serializer.toJsonObject(dummy)).to.throw();
    });

    describe('default behaviour', () => {

        it('uses original class property name in serialized object by default');
        it('is able to serialize JSON primitive types');
        it('is able to serialize arrays and maps');

    });

    describe('property mapping overrides', () => {});
    describe('serialize function overrides', () => {});

});
