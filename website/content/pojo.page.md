---
title: POJO
---

# POJO

It may be preferrable in some cases to work with plain JS objects instead of class instances.

It is possible with [`"as"`](/options#as) and [`"toPojo"`](/options#topojo) options
for `deflate` / `inflate` functions respectively.
We use class definition to define the shape of an object, but we never instantiate it:

```ts
import { deflate, inflate, Serialize } from 'serialazy';

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
```

Serialize plain JS object with [`"as"`](/options#as) option:

```ts
const shape: Shape = { // <- plain object, NOT Shape instance
    name: 'circle1',
    position: { x: 10, y: 20 }
};

const serialized = deflate(shape, { as: Shape });
expect(serialized).to.deep.equal({
    n: 'circle1',
    p: [ 10, 20 ]
});
```

Deserialize to plain JS object with [`"toPojo"`](/options#topojo) option:

```ts
const deserialized = inflate(Shape, serialized, { toPojo: true });
expect(deserialized.constructor).to.equal(Object); // <- plain object
expect(deserialized).to.deep.equal(shape);
```
