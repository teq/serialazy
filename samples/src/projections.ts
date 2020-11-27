import { deflate, Serialize } from 'serialazy';

import chai = require('chai');
const { expect } = chai;

(() => {

    class Position {

        @Serialize() // <- defined in "default" projection
        @Serialize({ projection: 'alt', name: 'col' })
        public x: number;

        @Serialize() // <- defined in "default" projection
        @Serialize({ projection: 'alt', name: 'row' })
        public y: number;

    }

    const pos = Object.assign(new Position(), { x: 1, y: 2 });

    const obj1 = deflate(pos);
    expect(obj1).to.deep.equal({ x: 1, y: 2 });

    const obj2 = deflate(pos, { projection: 'alt' });
    expect(obj2).to.deep.equal({ col: 1, row: 2 });

})();

(() => {

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

})();
