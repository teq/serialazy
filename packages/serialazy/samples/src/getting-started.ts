import { deflate, inflate, Serializable, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

(() => { // Without Serializable

    // Position class serializes to a tuple: [number, number]
    @Serialize({
        down: (pos: Position) => [pos.x, pos.y],
        up: (tuple) => Object.assign(new Position(), { x: tuple[0], y: tuple[1] })
    })
    class Position {
        public x: number;
        public y: number;
    }

    // Shape is a "property bag" serializable
    class Shape {
        @Serialize() public name: string;
    }

    // Sphere inherits property serializers from Shape
    class Sphere extends Shape {
        @Serialize() public radius: number;
        @Serialize() public position: Position; // Position defined below
    }

    const sphere = Object.assign(new Sphere(), {
        name: 'sphere1',
        radius: 10,
        position: Object.assign(new Position(), {
            x: 3,
            y: 5
        })
    });

    const serialized = deflate(sphere);

    expect(serialized).to.deep.equal({
        name: 'sphere1',
        radius: 10,
        position: [3, 5]
    });

    const deserialized = inflate(Sphere, serialized);

    // Deserialized sphere should be identical with the original one
    expect(deserialized).to.deep.equal(sphere);

})();

(() => { // With Serializable

    // Position class serializes to a tuple: [number, number]
    @Serialize({
        down: (pos: Position) => [pos.x, pos.y],
        up: (tuple) => Object.assign(new Position(), { x: tuple[0], y: tuple[1] })
    })
    class Position extends Serializable {
        public x: number;
        public y: number;
    }

    // Shape is a "property bag" serializable
    class Shape extends Serializable {
        @Serialize() public name: string;
    }

    // Sphere inherits property serializers from Shape
    class Sphere extends Shape {
        @Serialize() public radius: number;
        @Serialize() public position: Position; // Position defined below
    }

    const sphere = Sphere.create({
        name: 'sphere1',
        radius: 10,
        position: Position.create({ x: 3, y: 5 })
    });

    const serialized = deflate(sphere);

    expect(serialized).to.deep.equal({
        name: 'sphere1',
        radius: 10,
        position: [3, 5]
    });

    const deserialized = inflate(Sphere, serialized);

    // Deserialized sphere should be identical with the original one
    expect(deserialized).to.deep.equal(sphere);

})();
