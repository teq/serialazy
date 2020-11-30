---
title: Getting Started
---

# Getting Started

**Serialazy** is a serialization / data-mapping library
which can be used to deflate/inflate TypeScript class instances as well as plain JS objects ([POJO](/pojo)).

Features:
- Default serializers for primitive types (string, number, boolean)
- Support for [optional](/options#optional), [nullable](/options#nullable) and [mapped](/options#name) properties
- Recursive serialization for nested data structures
- Property serializers [inheritance](/inheritance) (from parent class to a child)
- User defined serialization functions for properties and types
- Alternative [projections](/projections)
- [Async](/async) serialization
- TypeScript-friendly API based on decorators

> **⚠ Note:** Version 3.x.x introduces breaking [changes](/changelog#v300) compared to 2.x.x.

## Requirements

Library makes use of TypeScript experimental feature which emits type metadata to the resulting JS.
Make sure that you enabled `experimentalDecorators` and `emitDecoratorMetadata` in your `tsconfig.json`.

## Installation

```shell
npm i --save serialazy
```

## Basic usage

```ts
import { deflate, inflate } from 'serialazy';
const serialized = deflate(serializable);
const deserialized = inflate(SerializableType, serialized);
```

Where:
- `serialized` is a JSON-compatible value which can be safely passed to `JSON.stringify`
- `SerializableType` is a constructor function for serializable type
- `serializable` is a primitive (string, number, boolean or their "boxed" variants, null, undefined), or a _non-primitive_ serializable

There are 2 types of _non-primitive_ serializables:

__1. A type with custom serializer__

Is a TS class decorated with `@Serialize()`.

```ts
import { Serialize } from 'serialazy';

// Position class serializes to a tuple: [number, number]
@Serialize({
    down: (pos: Position) => [pos.x, pos.y],
    up: (tuple) => Object.assign(new Position(), { x: tuple[0], y: tuple[1] })
})
class Position {
    public x: number;
    public y: number;
}
```

__2. A "property bag"__

Is a TS class having properties decorated with `@Serialize()`.

- _Always_ serializes to a plain object
- Can extend (inherit from) another property bag

```ts
import { Serialize } from 'serialazy';

// Shape is a "property bag" serializable
class Shape {
    @Serialize() public name: string;
}

// Sphere inherits property serializers from Shape
class Sphere extends Shape {
    @Serialize() public radius: number;
    @Serialize() public position: Position;
}
```

Above classes can be serialized / deserialized like this:

```ts
import { deflate, inflate } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

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
```

## Serializable base class

Library provides an _optional_ abstract base class for serializables.
Currently it only provides static factory method `create` which makes instance creation more compact
and type-safe. Above example could look like this:

```ts
import { Serializable, Serialize } from 'serialazy';

@Serialize({ ... })
class Position extends Serializable { ... }

class Shape extends Serializable { ... }

class Sphere extends Shape { ... }

const sphere = Sphere.create({
    name: 'sphere1',
    radius: 10,
    position: Position.create({ x:3, y: 5 })
});

...
```
