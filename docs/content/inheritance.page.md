---
title: Class Inheritance
---

# Class Inheritance

Property bag serializables inherit all property serializers from parent (property bag) class

```ts
import { deflate, inflate, Serialize } from 'serialazy';

abstract class Shape {
    @Serialize() public x: number;
    @Serialize() public y: number;
}

class Rectangle extends Shape {
    @Serialize({ name: 'w' }) public width: number;
    @Serialize({ name: 'h' }) public height: number;
}

const rect = Object.assign(new Rectangle(), {
    x: 1, y: 2, width: 5, height: 3
});

const serialized = deflate(rect);
// serialized includes all props from Rectangle + Shape
expect(serialized).to.deep.equal({
    x: 1, y: 2, w: 5, h: 3
});

const deserialized = inflate(Rectangle, serialized);
// deserialized includes all props from Rectangle + Shape
expect(deserialized).to.deep.equal(rect);
```

> __Note:__ Child class can shadow parent's property serializers.
