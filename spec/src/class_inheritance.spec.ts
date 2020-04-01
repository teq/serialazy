import chai = require('chai');

import { deflate, inflate, Serialize } from 'serialazy';

import Serializable from './serializable';

const { expect } = chai;

describe('class inheritance', () => {

    @Serialize({
        down: (point: Position) => `(${point.x},${point.y})`,
        up: (str: string) => {
            const match = str.match(/^\((\d+),(\d+)\)$/);
            if (!match) { throw new Error(`Invalid point: ${str}`); }
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


    describe('when descendant define a type serializer', () => {

        it('should override all property serializers: own and inherited', () => {

            @Serialize({
                down: (rect: MyRectangle) => {
                    return `(${rect.position.x},${rect.position.y}),(${rect.width},${rect.height})`;
                },
                up: (str: string) => {
                    const match = str.match(/^\((\d+),(\d+)\)\,\((\d+),(\d+)\)$/);
                    if (!match) { throw new Error(`Invalid rectangle: ${str}`); }
                    const [, xStr, yStr, widthStr, heightStr] = match;
                    return MyRectangle.create({
                        position: Object.assign(new Position(), {
                            x: Number.parseInt(xStr),
                            y: Number.parseInt(yStr)
                        }),
                        width: Number.parseInt(widthStr),
                        height: Number.parseInt(heightStr)
                    });
                }
            })
            class MyRectangle extends Rectangle {}

            const rectangle = MyRectangle.create({
                position: Position.create({ x: 23, y: 34 }),
                width: 5,
                height: 6
            });

            const serialized = deflate(rectangle);
            expect(serialized).to.deep.equal('(23,34),(5,6)');

            const deserialized = inflate(MyRectangle, serialized);
            expect(deserialized).to.deep.equal(rectangle);

        });

    });

    describe('when descendant define property serializers', () => {

        describe('and ancestor(-s) has property serializers', () => {

            it('should fail to redefine own property serializers', () => {

                expect(() => {
                    // tslint:disable-next-line:no-unused-variable
                    class Person {
                        @Serialize() @Serialize() public name: number;
                    }
                }).to.throw('Unable to redefine serializer for "name" property of "Person"');

            });

            it('be able to shadow inherited property serializers', () => {

                class MyRectangle extends Rectangle {

                    @Serialize({
                        name: 'p',
                        down: (pos: Position) => [pos.x, pos.y],
                        up: ([x, y]) => Position.create({ x, y })
                    })
                    public position: Position;

                    @Serialize({ name: 'w' })
                    public width: number;

                    @Serialize({ name: 'h' })
                    public height: number;

                }

                const rectangle = MyRectangle.create({
                    position: Position.create({ x: 2, y: 3 }),
                    width: 5,
                    height: 6
                });

                const serialized = deflate(rectangle);
                expect(serialized).to.deep.equal({ p: [2, 3], w: 5, h: 6 });

                const deserialized = inflate(MyRectangle, serialized);
                expect(deserialized).to.deep.equal(rectangle);

            });

            it('should produce a serializable inheriting all property serializers', () => {

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

    });

    describe('when descendant doesn\'t define any serializers', () => {

        describe('and ancestor(-s) has property serializers', () => {

            it('should produce a serializable inheriting all property serializers', () => {

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

        describe('and ancestor has type serializers', () => {

            it('should produce a non-serializable', () => {

                class TaggedPoint extends Position {
                    public tag: string;
                }

                const point = TaggedPoint.create({ x: 3, y: 4, tag: 'not serializable' });
                expect(() => deflate(point)).to.throw('Unable to serialize an instance of "TaggedPoint"');

            });

        });

    });

});
