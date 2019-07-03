**Serialazy** is an uniform library for TypeScript class serialization which supports various serialization backends.
This package implements a JSON backend. Other backends:
* [BSON/MongoDB](https://github.com/teq/serialazy-bson)

> **Note:** Version 3.x.x introduces breaking changes in API and is not compatible with 2.x.x.

## Overview

Features:
- Default serializers for primitive types (string, number, boolean)
- Support for optional / nullable / mapped (different property name in serialized object) properties
- Recursive serialization (circular references not handled yet)
- Custom (user defined) serialization functions for properties and types
- Child class inherits property serializers from parent
- TypeScript-friendly API based on decorators

Planned:
- Circular references
- [Projections](https://github.com/teq/serialazy/issues/4)

## Requirements

Library can be consumed _only_ from **TypeScript** projects because it makes use of TypeScript experimental feature which emits type metadata to the resulting JS. Make sure that you enabled `experimentalDecorators` and `emitDecoratorMetadata` in your `tsconfig.json`.

## Installation

`npm i --save serialazy`

## Usage

```ts
import { deflate, inflate } from 'serialazy';
const serialized = deflate(serializable);
const deserialized = inflate(SerializableType, serialized);
```

Where:
- `serialized` is a JSON-compatible value which can be safely passed to `JSON.stringify`
- `SerializableType` is a constructor function for serializable type (String/Number/Boolean for primitives)
- `serializable` is a primitive (string, number, boolean and their "boxed" variants, null, undefined), or a _non-primitive serializable_

There are 2 types of _non-primitive serializables_:

### 1. A "property bag"

Is a JS class with properties decorated with `@Serialize()`.

- _Always_ serializes to a plain JS object
- Can extend (inherit from) another property bag, but will throw en error if child class "shadows" a property from a base class.

Example:

```ts

// A "property bag" serializable
class Person {

    @Serialize() public name: string;

    @Serialize({
        down: (date: Date) => date.toISOString(),
        up: (isoDateStr: string) => new Date(isoDateStr)
    })
    public birthday: Date;

}

// Actor inherits all property serializers from Person
class Actor extends Person {
    @Serialize() public hasOscar: boolean;
}

```

### 2. Type (class) with custom serializer

A JS class decorated with `@Serialize()`.

- Serializes to any JSON-compatible value
- Can not be a base class for other serializables
- Can not inherit from other serializables

Example:

```ts

// Point class serializes to a tuple "[number, number]"
@Serialize({
    down: (point: Point) => [point.x, point.y],
    up: (tuple) => Object.assign(new Point(), { x: tuple[0], y: tuple[1] })
})
class Point {
    public x: number;
    public y: number;
}

```

## Examples

### Simplest case

```ts

import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // "Serialize" decorator tries to pick a default serializer for given data type
    @Serialize() public title: string;
    @Serialize() public pages: number;

    // Properties not decorated by `Serialize` are NOT serialized
    public notes: string;

}

// *** Create instance
const book = Object.assign(new Book(), {
    title: 'The Adventure of the Yellow Face',
    pages: 123,
    notes: 'Interesting story'
});

// *** Serialize
const serialized = deflate(book); // JSON-compatible object (can be safely passed to `JSON.stringify`)

expect(serialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
    // Notice that "notes" is not serialized
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    pages: 123
});

```

### Property serializer options

```ts

import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // "Serialize" decorator can accept options:
    // * `optional` allows property to be `undefined` (default: `false`)
    // * `nullable` allows property to be `null (default: `false`)
    // * `name` allows to override property name
    @Serialize({ optional: true }) public isbn: string;

    @Serialize({ name: 'summary' }) public description: string;

}

// *** Create instance
const book = Object.assign(new Book(), {
    description: 'Descriptive text',
    // Note that "isbn" is undefined and it won't throw during deserialization because `optional: true`
});

// *** Serialize
const serialized = deflate(book);

expect(serialized).to.deep.equal({
    summary: 'Descriptive text' // note that "description" is mapped to "summary" in serialized object
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);

```

### Custom property serializer

```ts

import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Book {

    // A custom serializer which converts Date to ISO date string
    @Serialize({
        name: 'releaseDate', // Note that custom serializer can accept options
        down: (val: Date) => val.toISOString(),
        up: (val) => new Date(val)
    })
    public publicationDate: Date;

    // A custom serializer which converts Map to a JSON-compatible array of objects
    @Serialize({
        down: (val: Map<number, string>) => Array.from(val).map(([page, title]) => ({ page, title })),
        up: (val) => new Map(val.map<[number, string]>(ch => [ch.page, ch.title])),
    })
    public contents: Map<number, string>;

}

// *** Create instance
const book = Object.assign(new Book(), {
    publicationDate: new Date('1893-02-01T00:00:00.000Z'),
    contents: new Map([
        [1, 'Introduction'],
        [5, 'Chapter 1'],
        [9, 'Chapter 2']
    ])
});

// *** Serialize
const serialized = deflate(book);

expect(serialized).to.deep.equal({
    releaseDate: '1893-02-01T00:00:00.000Z',
    contents: [
        { page: 1, title: 'Introduction' },
        { page: 5, title: 'Chapter 1' },
        { page: 9, title: 'Chapter 2' }
    ]
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);

```

### Recursive serialization

```ts

import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition
class Author {
    @Serialize() public name: string;
}

class Book {
    @Serialize() public title: string;
    @Serialize() public author: Author; // Serializes Author recursively
}

// *** Create instance
const book = Object.assign(new Book(), {
    title: 'The Adventure of the Yellow Face',
    author: Object.assign(new Author(), {
        name: 'Arthur Conan Doyle'
    }),
});

// *** Serialize
const serialized = deflate(book);

expect(serialized).to.deep.equal({
    title: 'The Adventure of the Yellow Face',
    author: {
        name: 'Arthur Conan Doyle'
    }
});

// *** Deserialize
const deserialized = inflate(Book, serialized);

expect(deserialized instanceof Book).to.equal(true);
expect(deserialized).to.deep.equal(book);

```

### Class inheritance

```ts

import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definitions
@Serialize({
    down: (point: Point) => [point.x, point.y],
    up: (tuple) => Object.assign(new Point(), { x: tuple[0], y: tuple[1] })
})
class Point {
    public x: number;
    public y: number;
}

class Shape {
    @Serialize() public position: Point;
}

class Circle extends Shape { // inherits props & serializers from Shape
    @Serialize() public radius: number;
}

// *** Create instance
const circle = Object.assign(new Circle(), {
    position: Object.assign(new Point(), { x: 23, y: 34 }),
    radius: 11
});

// *** Serialize
const serialized = deflate(circle);

expect(serialized).to.deep.equal({
    position: [23, 34],
    radius: 11
});

// *** Deserialize
const deserialized = inflate(Circle, serialized);

expect(deserialized instanceof Circle).to.equal(true);
expect(deserialized).to.deep.equal(circle);

```
