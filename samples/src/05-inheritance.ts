import { deserialize, Serializable, serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definitions
@Serializable.Type({
    down: (point: Point) => [point.x, point.y],
    up: (tuple) => Object.assign(new Point(), { x: tuple[0], y: tuple[1] })
})
class Point {
    public x: number;
    public y: number;
}

class Shape {
    @Serializable.Prop() public position: Point;
}

class Circle extends Shape { // inherits props & serializers from Shape
    @Serializable.Prop() public radius: number;
}

// *** Create instance
const circle = Object.assign(new Circle(), {
    position: Object.assign(new Point(), { x: 23, y: 34 }),
    radius: 11
});

// *** Serialize
const serialized = serialize(circle);

expect(serialized).to.deep.equal({
    position: [23, 34],
    radius: 11
});

// *** Deserialize
const deserialized = deserialize(serialized, Circle);

expect(deserialized instanceof Circle).to.equal(true);
expect(deserialized).to.deep.equal(circle);
