
Overview
--------

Features:
- Default serializers for primitive types (string, number, boolean)
- Support for optional / nullable properties
- Recursive object tree serialization (circular references not handled yet)
- Custom property serialization functions
- TypeScript-friendly API based on decorators

Planned:
- Class inheritance
- Circular references
- Various 'serialization backends', not just JSON

Requirements
------------

Library can be consumed _only_ from **TypeScript** projects because it make use of TypeScript experimental feature which emits type metadata to be used in runtime. Make sure that you enabled `--emitDecoratorMetadata` in your `tsconfig.json`.

Installation
------------

`npm i --save serialazy`

Usage
-----

Simplest case:

```ts

import { deflate, inflate, Serialize } from 'serialazy';

class Book {

    @Serialize() public title: string;

    @Serialize() public pages: number;

    // Serializer options:
    // * `optional` allows property to be `undefined` (default: `false`)
    // * `nullable` allows property to be `null (default: `false`)
    @Serialize({ optional: true, nullable: true }) public isbn: string;

    // Properties not marked by `Serialize` decorator are **not** serialized
    public notes: string;

}

const book = new Book();
book.title = 'The Adventure of the Yellow Face';
book.pages = 123;
book.notes = 'Interesting story';

// *** Serialize
const jsonObj = deflate(book); // `jsonObj` is a JSON-compatible object (can be safely passed to `JSON.stringify`)

// jsonObj = {
//     "title": "The Adventure of the Yellow Face",
//     "pages": 123
// }

// *** Deserialize
const newBook = inflate(Book, jsonObj);

// `newBook` is an instance of `Book` and equals to `book` except `notes` property which was not serialized

```

Custom property serializer:

```ts

import { deflate, inflate, Serialize } from 'serialazy';

class Book {

    // A custom serializer which converts Map to a JSON-compatible array of objects
    @Serialize.Custom({
        down: (val: Map<number, string>) => Array.from(val).map(([page, title]) => ({ page, title })),
        up: (val) => new Map(val.map<[number, string]>(ch => [ch.page, ch.title])),
    })
    public contents: Map<number, string>;

}

const book = new Book();
book.contents = new Map([
    [1, 'Introduction'],
    [5, 'Chapter 1'],
    [9, 'Chapter 2']
]);

// *** Serialize
const jsonObj = deflate(book);

// jsonObj = {
//     "contents": [
//       {
//         "page": 1,
//         "title": "Introduction"
//       },
//       {
//         "page": 5,
//         "title": "Chapter 1"
//       },
//       {
//         "page": 9,
//         "title": "Chapter 2"
//       }
//     ]
// }

// *** Deserialize
const sameBook = inflate(Book, jsonObj);

```

Recursive serialization:

```ts

import { deflate, inflate, Serialize } from 'serialazy';

class Author {

    @Serialize() public name: string;

}

class Book {

    @Serialize() public title: string;

    @Serialize() public author: Author;

    @Serialize.Custom({ down: (val: Date) => val.toISOString(), up: (val: string) => new Date(val) })
    public releaseDate: Date;

}

const author = new Author();
author.name = 'Arthur Conan Doyle';

const book = new Book();
book.author = author;
book.title = 'The Adventure of the Yellow Face';
book.releaseDate = new Date('February 1893');

const jsonObj = deflate(book);

// jsonObj = {
//   "title": "The Adventure of the Yellow Face",
//   "author": {
//     "name": "Arthur Conan Doyle"
//   },
//   "releaseDate": "1893-01-31T21:00:00.000Z"
// }

const sameBook = inflate(Book, jsonObj); // `sameBook` in an instance of `Book` and deep equal to `book`

```
