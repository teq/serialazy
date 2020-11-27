---
title: Projections
---

# Projections

Projection is one of multiple variants of serialization for a given class.
It might be useful when data should be presented in different formats when passed across different data channels.

By default all serializers are defined and serialization / deserialization is done in projection called `"default"`.

Alternative serialisers can be defined using [`"projection"`](/options#projection) option:

```ts
import { deflate, inflate, Serialize } from 'serialazy';

class Position {

    @Serialize() // <- defined in "default" projection
    @Serialize({ projection: 'alt', name: 'col' })
    public x: number;

    @Serialize() // <- defined in "default" projection
    @Serialize({ projection: 'alt', name: 'row' })
    public y: number;

}
```

and later serialize / deserialize it in default or alternative projection:

```ts
const pos = Object.assign(new Position(), { x: 1, y: 2 });

const obj1 = deflate(pos);
expect(obj1).to.deep.equal({ x: 1, y: 2 });

const obj2 = deflate(pos, { projection: 'alt' });
expect(obj2).to.deep.equal({ col: 1, row: 2 });
```

Another example demonstrates that `User` serializes to its `id` when serialized in "api" projection.
Note that it's not possible do deserialize it in "api" projection without defining corresponding `"up"`
deserialization function, which can be [async](/async) to be able to query a database for that user.

```ts
import { deflate, inflate, Serialize } from 'serialazy';

@Serialize({ projection: 'api', down: (user: User) => user.id })
class User {
    @Serialize() public id: string;
    @Serialize() public email: string;
}

const user = Object.assign(new User(), {
    id: "<unique_id>",
    email: 'john.doe@example.com',
});

expect(deflate(user)).to.deep.equal({
    id: "<unique_id>",
    email: 'john.doe@example.com',
});

expect(deflate(user, { projection: 'api' })).to.deep.equal("<unique_id>");
```

## Fallback to "default" projection

`"default"` projection has a special role. It is used as a fallback if type is not serializable in given projection.
This behaviour can be disabled by setting [`"fallbackToDefaultProjection"`](/options#fallbacktodefaultprojection) to `false`
when calling `deflate` / `inflate`.

> __Note:__ Serializers for primitive types (string, number, boolean) are defined in `"default"` projection and
  always used as a fallback, regardless of the value of `"fallbackToDefaultProjection"`.
