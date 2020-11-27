import { deflate, inflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

function randDefer<T>(value: T): Promise<T> {
    const pause = Math.random() * 100;
    return new Promise((resolve) => setTimeout(() => resolve(value), pause));
}

async function getUserFieldsById(id: string) {
    if (id !== '<unique_id>') {
        throw new Error(`No such user: ${id}`);
    } else {
        return randDefer({
            id: '<unique_id>',
            email: 'john.doe@example.com',
            isAdmin: true
        });
    }
}

(async () => {

    @Serialize({
        down: (user: User) => user.id,
        up: async (id: string) => Object.assign(new User(), await getUserFieldsById(id))
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

})();
