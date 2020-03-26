import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('custom type serializer', () => {

    @Serialize({
        down: (val: Point) => `(${val.x},${val.y})`,
        up: (val) => {
            const match = val.match(/^\((\d+),(\d+)\)$/);
            if (!match) { throw new Error(`Invalid point: ${val}`); }
            const [, xStr, yStr] = match;
            return Point.create({ x: Number.parseInt(xStr), y: Number.parseInt(yStr) });
        }
    })
    class Point extends Serializable {
        public x: number;
        public y: number;
    }

    it('is able to serialize a type instance', () => {
        const point = Point.create({ x: 2, y: 3 });
        const serialized = deflate(point);
        expect(serialized).to.equal('(2,3)');
    });

    it('is able to deserialize a type instance', () => {
        const point = inflate(Point, '(4,5)');
        expect(point).to.be.instanceOf(Point);
        expect(point).to.deep.equal({ x: 4, y: 5 });
    });

    it('can\'t be re-defined', () => {
        expect(() => {
            Serialize({ down: null, up: null })(Point);
        }).to.throw('Unable to re-define custom type serializer for "Point"');
    });

});
