import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('class inheritance', () => {

    @Serialize({
        down: (val: Position) => `(${val.x},${val.y})`,
        up: (val) => {
            const match = val.match(/^\((\d+),(\d+)\)$/);
            if (!match) { throw new Error(`Invalid point: ${val}`); }
            const [, xStr, yStr] = match;
            return Position.create({ x: Number.parseInt(xStr), y: Number.parseInt(yStr) });
        }
    })
    class Position extends Serializable {
        public x: number;
        public y: number;
    }

    abstract class Shape extends Serializable {
        @Serialize() public position: Position;
    }

    class Rectangle extends Shape {
        @Serialize() public width: number;
        @Serialize() public height: number;
    }

    describe ('when property-bag serializable extends some other class', () => {

        it('should fail if it has custom type serializables in prototype chain', () => {

            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class TaggedPosition extends Position {
                    @Serialize() public tag: string;
                }
            }).to.throw('A property-bag serializable can\'t inherit from a type with custom serializer');

        });

        it('should fail when trying to shadow inherited serializable properties', () => {

            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class MyRectangle extends Rectangle {
                    @Serialize() public width: number;
                }
            }).to.throw('Unable to redefine/shadow serializer for "width" property of "MyRectangle"');

        });

        it('should inherit from all property-bag serializables in prototype chain', () => {

            const rectangle = Rectangle.create({
                position: Position.create({ x: 23, y: 34 }),
                width: 5,
                height: 6
            });

            const serialized = deflate(rectangle);
            expect(serialized).to.deep.equal({
                position: '(23,34)',
                width: 5,
                height: 6
            });

            const deserialized = inflate(Rectangle, serialized);
            expect(deserialized).to.deep.equal(rectangle);

        });

    });

    describe ('when a non-serializable class extends property-bag serializable', () => {

        it('should become a property-bag serializable', () => {

            class Circle extends Shape {
                public radius: number; // not serializable
            }

            const circle = Circle.create({
                position: Position.create({ x: 3, y: 4 }),
                radius: 10
            });

            const serialized = deflate(circle);
            expect(serialized).to.deep.equal({ position: '(3,4)' }); // no radius

            const deserialized = inflate(Circle, serialized);
            expect(deserialized).to.deep.equal({ position: { x: 3, y: 4 } }); // no radius
            expect(deserialized).to.be.instanceOf(Circle);

        });

    });

    describe('when custom type serializable extends some other class', () => {

        it('should fail if it has other serializables in prototype chain', () => {

            [
                () => {
                    @Serialize({ down: null, up: null })
                    // tslint:disable-next-line:no-unused-variable
                    class TaggedPoint extends Position {
                        public tag: string;
                    }
                },
                () => {
                    @Serialize({ down: null, up: null })
                    // tslint:disable-next-line:no-unused-variable
                    class TaggedRectangle extends Rectangle {
                        public tag: string;
                    }
                }
            ].forEach(f => expect(f).to.throw('Can\'t define a custom serializer on type which inherits from another serializable'));

        });

    });

    describe('when a non-serializable class extends custom type serializable', () => {

        it('should be a non-serializable', () => {

            class TaggedPoint extends Position {
                public tag: string; // not serializable
            }

            const point = TaggedPoint.create({ x: 3, y: 4, tag: 'not serializable' });

            expect(() => deflate(point)).to.throw('Unable to serialize an instance of "TaggedPoint"');

        });

    });

});
