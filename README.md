
## Overview

Features:
- Default serializers for primitive types (string, number, boolean)
- Support for optional / nullable / mapped (different property name in serialized object) properties
- Recursive serialization (circular references not handled yet)
- Child class inherits serializers from parent
- Custom (user defined) property serialization functions
- TypeScript-friendly API based on decorators

Planned:
- Circular references
- Various 'serialization backends', not just JSON

## Requirements

Library can be consumed _only_ from **TypeScript** projects because it makes use of TypeScript experimental feature which emits type metadata to the resulting JS. Make sure that you enabled `--emitDecoratorMetadata` in your `tsconfig.json`.

## Installation

`npm i --save serialazy`

## Usage

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

### Serializer options

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
    @Serialize.Custom({
        down: (val: Date) => val.toISOString(),
        up: (val) => new Date(val)
    }, { name: 'releaseDate' }) // Note that custom serializer can accept options
    public publicationDate: Date;

    // A custom serializer which converts Map to a JSON-compatible array of objects
    @Serialize.Custom({
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

// *** Class definition
class Shape {
    // Serializes [number, number] tuple to "x,y" string
    @Serialize.Custom({
        down: (pos: [number, number]) => pos.join(','),
        up: str => str.split(',').map(s => Number.parseFloat(s))
    })
    public position: [number, number];
}

class Circle extends Shape { // inherits props & serializers from Shape
    @Serialize() public radius: number;
}

// *** Create instance
const circle = Object.assign(new Circle(), {
    position: [23, 34],
    radius: 11
});

// *** Serialize
const serialized = deflate(circle);

expect(serialized).to.deep.equal({
    position: '23,34',
    radius: 11
});

// *** Deserialize
const deserialized = inflate(Circle, serialized);

expect(deserialized instanceof Circle).to.equal(true);
expect(deserialized).to.deep.equal(circle);

```

### `isSerializable` function

Checks if target is an instance of serializable class

```ts

import { isSerializable, Serialize } from './@lib/serialazy';

import chai = require('chai');
const { expect } = chai;

// *** Class definition

class Book {
    @Serialize() public title: string;
}

class Author {
    public name: string;
}

// *** Check

expect(isSerializable(new Book())).to.equal(true); // serializable
expect(isSerializable(new Author())).to.equal(false); // not serializable
expect(isSerializable(123)).to.equal(false); // not serializable
expect(isSerializable('test')).to.equal(false); // not serializable

```
