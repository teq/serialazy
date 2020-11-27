---
title: Async Serialization
---

# Async Serialization

If one or more type serializer or deserializer (`down` or `up` functions) return a `Promise` value,
it is possible to await until they are resolved with `deflate.resolve` and `inflate.resolve`.

Unlike `deflate` and `inflate`, these functions return a `Promise` to serialized / deserialized value.

Following example serializes `User` to its `id` and deserializes using async `getUserFieldsById` function.

```ts
import { deflate, inflate, Serialize } from 'serialazy';
import { getUserFieldsById } from './db';

@Serialize({
    down: (user: User) => user.id,
    up: (id: string) => Object.assign(new User(), getUserFieldsById(id))
})
class User {
    public id: string;
    public email: string;
    public isAdmin: boolean;
}

const user = Object.assign(new User(), {
    id: '<unique_id>',
    email: 'john.doe@example.com',
    isAdmin: true
});

const serialized = deflate(user);
expect(serialized).to.equal('<unique_id>');

const deserialized = await inflate.resolve(User, serialized);
expect(deserialized).to.deep.equal({
    id: '<unique_id>',
    email: 'john.doe@example.com',
    isAdmin: true
});
```

> __Note:__ All properties of given instance are serialized / deserialized in parallel with `Promise.all()`.
