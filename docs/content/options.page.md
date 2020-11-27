---
title: Options
---

# Options

`@Serialize()` decorator and `inflate` / `deflate` functions accept options
which affect default serialization behaviour.

## Decorator options

### "down"

> __Applicable to:__ `type` and `property` serializers

Defines serializer function. `deflate` options passed as a second argument.

```ts
@Serialize({
    down: (coord: Coord, options) => [coord.x, coord.y]
})
class Coord {
    public x: number;
    public y: number;
}
```

### "up"

> __Applicable to:__ `type` and `property` serializers

Defines deserializer function. `inflate` options passed as a second argument.

```ts
@Serialize({
    up: (tuple: [number, number], { toPojo }) => Object.assign(
        toPojo ? {} : new Position(),
        { x: tuple[0], y: tuple[1] }
    )
})
class Coord {
    public x: number;
    public y: number;
}
```

### "type"

> __Applicable to:__ `type` and `property` serializers

Overrides the type of serializable.

Default value:

- For types: Type constructor function
- For properties: Value of `design:type` [metadata](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata) for given property

### "optional"

> __Applicable to:__ `property` serializers | __Default:__ `false`

Indicates if property can be `undefined`, otherwise `deflate` / `inflate` will throw.

```ts
class Book {
    @Serialize({ optional: true }) public isbn: string;
}
```

### "nullable"

> __Applicable to:__ `property` serializers | __Default:__ `false`

Indicates if property can be `null`, otherwise `deflate` / `inflate` will throw.

```ts
class Book {
    @Serialize({ nullable: true }) public isbn: string;
}
```

### "name"

> __Applicable to:__ `property` serializers

If defined it forces to use different property name in serialized object.

```ts
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
```

### "projection" (decorator option)

> __Applicable to:__ `type` and `property` serializers | __Default:__ `"default"`

Forces serializer to be defined in a given projection.

See [Projections](/projections) section for more details.

## Serialization options

### "projection" (serialization option)

> __Applicable to:__ `deflate` and `inflate` | __Default:__ `"default"`

Forces serialization in given projection.

See [Projections](/projections) section for more details.

### "fallbackToDefaultProjection"

> __Applicable to:__ `deflate` and `inflate` | __Default:__ `true`

If type or property is not serializable in given projection
it tries to serialize / deserialize it in `"default"` projection.

See [Projections](/projections) section for more details.


### "prioritizePropSerializers"

> __Applicable to:__ `deflate` and `inflate` | __Default:__ `false`

By default, if class has own serializer defined and its properties also have serializers (property bag),
class own serializer takes precedence over property serializers. Set option to `true` to serialize instance
as a property bag. For recursive serialization this option applied to all nested properties.

```ts
@Serialize({ down: (coord: Coord) => [coord.x, coord.y] })
class Coord {
    @Serialize() public x: number;
    @Serialize() public y: number;
}

const coord = Object.assign(new Coord(), { x:1, y:2 });

const obj1 = deflate(coord);
expect(obj1).to.deep.equal([1, 2]);

const obj2 = deflate(coord, { prioritizePropSerializers: true });
expect(obj2).to.deep.equal({ x: 1, y: 2 });
```

### "as"

> __Applicable to:__ `deflate`

Serialize instance as if it were of the given type. It completely ignores type's own serializer
or its property serializers (if any) and uses serializer from provided type.

See also: [POJO](/pojo)

```ts
class Foo {
    @Serialize() public id: string;
}

@Serialize({ down: (bar: Bar) => bar.id })
class Bar {
    public id: string;
}

const foo = Object.assign(new Foo(), { id: 123 });

expect(deflate(foo)).to.equal({ id: 123 });

expect(deflate(foo, { as: Bar })).to.equal(123);
```

### "toPojo"

> __Applicable to:__ `inflate`

Deserialize to plain javascript object. When deserializing a property bag, instead of creating a new
instance of given type, it creates an empty JS object and writes all deserialized properties there.
In case of recursive serialization it affects deserialization of all nested properties.

See also: [POJO](/pojo)

```ts
class Foo {
    @Serialize() public id: number;
}

const foo1 = inflate(Foo, { id: 123 });
expect(foo1.constructor).to.equal(Foo);

const foo2 = inflate(Foo, { id: 123 }, { toPojo: true });
expect(foo2.constructor).to.equal(Object);
```
