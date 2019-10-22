import chai = require('chai');

import { deflate, inflate, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('class inheritance', () => {

    @Serialize.Type({
        down: (val: Point) => `(${val.x},${val.y})`,
        up: (val) => {
            const match = val.match(/^\((\d+),(\d+)\)$/);
            if (!match) { throw new Error(`Invalid point: ${val}`); }
            const [, xStr, yStr] = match;
            return Object.assign(new Point(), { x: Number.parseInt(xStr), y: Number.parseInt(yStr) });
        }
    })
    class Point {
        public x: number;
        public y: number;
    }

    class Shape {
        @Serialize() public position: Point;
    }

    class Rectangle extends Shape {
        @Serialize() public width: number;
        @Serialize() public height: number;
    }

    describe ('when property-bag serializable extends some other class', () => {

        it('should fail if it has custom type serializables in prototype chain', () => {

            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class TaggedPoint extends Point {
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
            }).to.throw('Unable to redefine/shadow serializer for property: width');

        });

        it('should inherit from all property-bag serializables in prototype chain', () => {

            const rectangle = Object.assign(new Rectangle(), {
                position: Object.assign(new Point(), {
                    x: 23, y: 34
                }),
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

            const circle = Object.assign(new Circle(), {
                position: Object.assign(new Point(), {
                    x: 3, y: 4
                }),
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
                    @Serialize.Type({ down: null, up: null })
                    // tslint:disable-next-line:no-unused-variable
                    class TaggedPoint extends Point {
                        public tag: string;
                    }
                },
                () => {
                    @Serialize.Type({ down: null, up: null })
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

            class TaggedPoint extends Point {
                public tag: string; // not serializable
            }

            const point = Object.assign(new TaggedPoint(), {
                x: 3, y: 4, tag: 'not serializable'
            });

            expect(() => deflate(point)).to.throw('Value is not serializable');

        });

    });

});
