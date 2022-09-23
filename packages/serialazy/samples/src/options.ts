import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

(() => { // "down"

    @Serialize({
        down: (coord: Coord, options) => [coord.x, coord.y]
    })
    class Coord {
        public x: number;
        public y: number;
    }

})();

(() => { // "up"

    @Serialize({
        up: (tuple: [number, number], { toPojo }) => Object.assign(
            toPojo ? {} : new Coord(),
            { x: tuple[0], y: tuple[1] }
        )
    })
    class Coord {
        public x: number;
        public y: number;
    }

})();

(() => { // "optional"

    class Book {
        @Serialize({ optional: true }) public isbn: string;
    }

})();

(() => { // "nullable"

    class Book {
        @Serialize({ nullable: true }) public isbn: string;
    }

})();

(() => { // "name"

    class Book {
        @Serialize({ name: 'summary' }) public description: string;
    }

    const book = Object.assign(new Book(), {
        description: 'A popular-science book on cosmology'
    });

    expect(deflate(book)).to.deep.equal({
        // NOTE: "description" mapped to "summary" in serialized object
        summary: 'A popular-science book on cosmology'
    });

})();

(() => { // "prioritizePropSerializers"

    @Serialize({ down: (coord: Coord) => [coord.x, coord.y] })
    class Coord {
        @Serialize() public x: number;
        @Serialize() public y: number;
    }

    const coord = Object.assign(new Coord(), { x: 1, y: 2 });

    const obj1 = deflate(coord);
    expect(obj1).to.deep.equal([1, 2]);

    const obj2 = deflate(coord, { prioritizePropSerializers: true });
    expect(obj2).to.deep.equal({ x: 1, y: 2 });

})();

(() => { // "as"

    class Foo {
        @Serialize() public id: number;
    }

    @Serialize({ down: (bar: Bar) => bar.id })
    class Bar {
        public id: number;
    }

    const foo = Object.assign(new Foo(), { id: 123 });

    expect(deflate(foo)).to.deep.equal({ id: 123 });

    expect(deflate(foo, { as: Bar })).to.equal(123);

})();

(() => { // "toPojo"

    class Foo {
        @Serialize() public id: number;
    }

    const foo1 = inflate(Foo, { id: 123 });
    expect(foo1.constructor).to.equal(Foo);

    const foo2 = inflate(Foo, { id: 123 }, { toPojo: true });
    expect(foo2.constructor).to.equal(Object);

})();
