import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

@Serialize({
    down: (pos: Position) => [pos.x, pos.y],
    up: (tuple: number[], { toPojo }) => Object.assign(
        toPojo ? {} : new Position(),
        { x: tuple[0], y: tuple[1] }
    )
})
class Position {
    public x: number;
    public y: number;
}

class Shape {
    @Serialize({ name: 'n' }) public name: string;
    @Serialize({ name: 'p' }) public position: Position;
}

const shape: Shape = { // <- plain object, NOT Shape instance
    name: 'circle1',
    position: { x: 10, y: 20 }
};

const serialized = deflate(shape, { as: Shape });
expect(serialized).to.deep.equal({
    n: 'circle1',
    p: [ 10, 20 ]
});

const deserialized = inflate(Shape, serialized, { toPojo: true });
expect(deserialized.constructor).to.equal(Object); // <- plain object
expect(deserialized).to.deep.equal(shape);
