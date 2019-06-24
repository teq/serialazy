import chai = require('chai');

import { deflate, inflate, Serializable } from 'serialazy';

const { expect } = chai;

describe('class inheritance', () => {

    @Serializable.Type({
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
        @Serializable.Prop() public position: Point;
    }

    class Rectangle extends Shape {
        @Serializable.Prop() public width: number;
        @Serializable.Prop() public height: number;
    }

    describe('for property-bag serializables', () => {

        it('should fail when trying to inherit from custom type serializable', () => {

            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class TaggedPoint extends Point {
                    @Serializable.Prop() public tag: string;
                }
            }).to.throw('A property-bag serializable can\'t inherit from a type with custom serializer');

        });

        it('allows to inherit property serialializers from ancestor classes', () => {

            const rectangle = Object.assign(new Rectangle(), {
                position: Object.assign(new Point(), { x: 23, y: 34 }),
                width: 5,
                height: 6
            });

            const serialized = deflate(rectangle);
            expect(serialized).to.deep.equal({
                position: '(23,34)',
                width: 5,
                height: 6
            });

            const deserialized = inflate(serialized, Rectangle);
            expect(deserialized).to.deep.equal(rectangle);

        });

        it('should fail when child class trying to shadow parent class serializable properties', () => {

            expect(() => {
                // tslint:disable-next-line:no-unused-variable
                class MyRectangle extends Rectangle {
                    @Serializable.Prop() public width: number;
                }
            }).to.throw('Unable to redefine/shadow serializer for "width" property of "MyRectangle"');

        });

    });

    describe('for custom type serializables', () => {

        it('should fail when trying to inherit from any serializable', () => {

            [
                () => {
                    @Serializable.Type({ down: null, up: null })
                    // tslint:disable-next-line:no-unused-variable
                    class TaggedPoint extends Point {
                        public tag: string;
                    }
                },
                () => {
                    @Serializable.Type({ down: null, up: null })
                    // tslint:disable-next-line:no-unused-variable
                    class TaggedRectangle extends Rectangle {
                        public tag: string;
                    }
                }
            ].forEach(f => expect(f).to.throw('Can\'t define a custom serializer on type which inherits from another serializable'));

        });

    });

});
