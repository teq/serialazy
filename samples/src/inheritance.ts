import { deflate, inflate, Serialize } from './@lib/serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Shape {
    // Serializes [number, number] tuple to "x,y" string
    @Serialize.Custom({
        down: (pos: [number, number]) => pos.join(','),
        up: str => str.split(',').map(s => Number.parseFloat(s))
    })
    public position: [number, number];
}

class Circle extends Shape { // inherits props & serializers from Shape
    @Serialize() public radius: number;
}

// *** Create instance
const circle = Object.assign(new Circle(), {
    position: [23, 34],
    radius: 11
});

// *** Serialize
const serialized = deflate(circle);

expect(serialized).to.deep.equal({
    position: '23,34',
    radius: 11
});

// *** Deserialize
const deserialized = inflate(Circle, serialized);

expect(deserialized instanceof Circle).to.equal(true);
expect(deserialized).to.deep.equal(circle);
