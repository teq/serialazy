import chai = require('chai');

import { deflate, inflate, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

describe('serialization/deserialization to/from a POJO ("as" and "toPojo" options)', () => {

    class Coord extends Serializable {
        @Serialize() public x: number;
        @Serialize() public y: number;
    }

    class Descriptor extends Serializable {
        @Serialize() public id: number;
        @Serialize() public name: string;
    }

    abstract class Element extends Serializable {
        @Serialize({ name: 'dsc' }) public descriptor: Descriptor;
        @Serialize({ name: 'pos' }) public position: Coord;
    }

    class Vector extends Element {
        @Serialize({ name: 'dir' }) public direction: Coord;
    }

    const vecPojo = {
        descriptor: { id: 123, name: 'vec1' },
        position: { x: -10, y: -5 },
        direction: { x: 3, y: 7 }
    };

    const vecObj = {
        dsc: { id: 123, name: 'vec1' },
        pos: { x: -10, y: -5 },
        dir: { x: 3, y: 7 }
    };

    it('is able to serialize POJO as if it were of type specified by "as" option', () => {
        const obj = deflate(vecPojo, { as: Vector });
        expect(obj).to.deep.equal(vecObj);
    });

    it('is able to deserialize class to a POJO when "toPojo" option is set', () => {
        const pojo = inflate(Vector, vecObj, { toPojo: true });
        expect(pojo).to.deep.equal(vecPojo);
        [pojo, pojo.descriptor, pojo.direction, pojo.position].forEach(arg => {
            expect(Object.getPrototypeOf(arg)).to.equal(Object.prototype);
        });
    });

});
