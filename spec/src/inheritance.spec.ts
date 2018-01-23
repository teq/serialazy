import chai = require('chai');

import { deflate, inflate, isSerializable, Serialize } from './@lib/serialazy';

const { expect } = chai;

describe('class inheritance', () => {

    class Shape {
        @Serialize.Custom({
            down: (pos: [number, number]) => pos.join(','),
            up: str => str.split(',').map(s => Number.parseFloat(s))
        })
        public position: [number, number];
    }

    class Rectangle extends Shape {
        @Serialize() public width: number;
        @Serialize() public height: number;
    }

    class Square extends Rectangle {
        @Serialize.Skip() public width: number;
        @Serialize.Skip() public height: number;
        @Serialize() public get size(): number {
            return this.width;
        }
        public set size(value) {
            this.width = value;
            this.height = value;
        }
    }

    it('allows to inherit all property serialializers of base classes', () => {
        const rectangle = new Rectangle();
        rectangle.position = [23, 34];
        rectangle.width = 5;
        rectangle.height = 6;
        const serialized = deflate(rectangle);
        expect(serialized).to.deep.equal({
            position: '23,34',
            width: 5,
            height: 6
        });
        const deserialized = inflate(Rectangle, serialized);
        expect(deserialized).to.deep.equal(rectangle);
    });

    it('allows child class to "shadow" serializers of base classes', () => {
        const square = new Square();
        square.position = [45, 56];
        square.size = 34;
        const serialized = deflate(square);
        expect(serialized).to.deep.equal({
            position: '45,56',
            size: 34
        });
        const deserialized = inflate(Square, serialized);
        expect(deserialized).to.deep.equal(square);
    });

    describe('when parent is serializable and child has no explicit serializers', () => {

        class TaggedRectangle extends Rectangle {
            public tag: string;
        }

        it('should result in child to be serializable too', () => {
            expect(isSerializable(TaggedRectangle)).to.equal(true);
        });

        it('should result in child to inherit all parent\'s serializers', () => {

            const original = Object.assign(new TaggedRectangle(), { position: [1, 2], width: 3, height: 4, tag: 'test' });
            expect(isSerializable(original)).to.equal(true);
            const serialized = deflate(original);
            expect(serialized).to.deep.equal({ position: '1,2', width: 3, height: 4 }); // NOTE: no `tag` in serialized object
            const deserialized = inflate(TaggedRectangle, serialized);
            expect(deserialized).to.deep.equal({ position: [1, 2], width: 3, height: 4 }); // NOTE: no `tag` in deserialized instance

        });

    });

});
