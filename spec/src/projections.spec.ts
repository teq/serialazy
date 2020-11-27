import chai = require('chai');

import { deflate, inflate, JsonType, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

type Constructor<T> = new () => T;

describe('projection options', () => {

    const TEST_PROJECTION = 'test';

    describe('when applied to decorator', () => {

        describe('on a type', () => {

            interface Named {
                name: string;
            }

            function itAppliesInDefaultProjection(ctor: Constructor<Named>) {

                it('applies decorator in default projection', () => {
                    const serializable = Object.assign(new ctor(), { name: 'joe' });
                    expect(() => deflate(serializable, {
                        projection: TEST_PROJECTION,
                        fallbackToDefaultProjection: false
                    })).to.throw();
                    const serialized = deflate(serializable);
                    expect(serialized).to.equal('joe');
                });

            }

            describe('when projection is undefined', () => {

                @Serialize({ down: (named: Named) => named.name })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to undefined', () => {

                @Serialize({ projection: undefined, down: (named: Named) => named.name })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to null', () => {

                @Serialize({ projection: null, down: (named: Named) => named.name })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to empty string', () => {

                @Serialize({ projection: '', down: (named: Named) => named.name })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is a non-empty string', () => {

                @Serialize({ projection: 'test', down: (named: Named) => named.name })
                class Person implements Named {
                    public name: string;
                }

                it('applies decorator in given projection', () => {
                    const serializable = Object.assign(new Person(), { name: 'joe' });
                    expect(() => deflate(serializable)).to.throw();
                    const serialized = deflate(serializable, { projection: TEST_PROJECTION });
                    expect(serialized).to.equal('joe');
                });

            });

        });

        describe('on a property', () => {

            describe('when projection is undefined/null or empty string', () => {

                class Person extends Serializable {

                    @Serialize()
                    public id: number;

                    @Serialize({ projection: undefined })
                    public name: string;

                    @Serialize({ projection: null })
                    public address: string;

                    @Serialize({ projection: '' })
                    public email: string;

                }

                it('applies decorator in default projection', () => {
                    const person = Person.create({
                        id: 1, name: 'joe', address: 'unknown', email: 'joe@example.com'
                    });
                    expect(() => deflate(person, {
                        projection: TEST_PROJECTION,
                        fallbackToDefaultProjection: false
                    })).to.throw();
                    const serialized = deflate(person);
                    expect(serialized).to.deep.equal({
                        id: 1, name: 'joe', address: 'unknown', email: 'joe@example.com'
                    });
                });

            });

            describe('when projection is a non-empty string', () => {

                class Person extends Serializable {

                    @Serialize({ projection: TEST_PROJECTION })
                    public id: number;

                    @Serialize({ projection: TEST_PROJECTION })
                    public name: string;

                }

                it('applies decorator in given projection', () => {
                    const person = Person.create({ id: 1, name: 'joe' });
                    expect(() => deflate(person)).to.throw();
                    const serialized = deflate(person, { projection: TEST_PROJECTION });
                    expect(serialized).to.deep.equal({ id: 1, name: 'joe' });
                });

            });

        });

    });

    describe('when applied to serialization functions', () => {

        @Serialize({
            down: (ts: Timestamp) => ts.date.toISOString(),
            up: (isoString: string) => new Timestamp(new Date(isoString))
        })
        @Serialize({
            projection: 'compact',
            down: (ts: Timestamp) => ts.date.getTime(),
            up: (unixTimeMs: number) => new Timestamp(new Date(unixTimeMs))
        })
        class Timestamp {
            public constructor(
                public date: Date
            ) {}
        }

        class JWT extends Serializable {

            @Serialize({ name: 'sub' })
            public subject: string;

            @Serialize({ name: 'iat' })
            public issuedAt: Timestamp;

        }

        class Person extends Serializable {

            @Serialize()
            @Serialize({ projection: 'compact', name: 'id' })
            public identifier: number;

            @Serialize()
            public name: string;

        }

        class User extends Person {

            @Serialize()
            public jwt: JWT;

            @Serialize()
            @Serialize({ projection: 'compact', name: 'lv' })
            public lastVisit: Timestamp;

        }

        const timestamp = new Timestamp(new Date());

        const user = User.create({
            identifier: 1,
            name: 'John Doe',
            jwt: JWT.create({
                subject: 'api',
                issuedAt: timestamp
            }),
            lastVisit: timestamp
        });

        const userDefaultProjection = {
            identifier: 1,
            name: 'John Doe',
            jwt: {
                sub: 'api',
                iat: timestamp.date.toISOString()
            },
            lastVisit: timestamp.date.toISOString()
        };

        const userCompactProjection = {
            id: 1,
            name: 'John Doe',
            jwt: {
                sub: 'api',
                iat: timestamp.date.getTime()
            },
            lv: timestamp.date.getTime()
        };

        describe('deflate', () => {

            function itSerializesInDefaultProjection(obj: JsonType) {
                it('performs serialization in default projection', () => {
                    expect(obj).to.deep.equal(userDefaultProjection);
                });
            }

            describe('when projection is undefined', () => {
                const obj = deflate(user);
                itSerializesInDefaultProjection(obj);
            });

            describe('when projection is set to undefined', () => {
                const obj = deflate(user, { projection: undefined });
                itSerializesInDefaultProjection(obj);
            });

            describe('when projection is null', () => {
                const obj = deflate(user, { projection: null });
                itSerializesInDefaultProjection(obj);
            });

            describe('when projection is set to empty string', () => {
                const obj = deflate(user, { projection: '' });
                itSerializesInDefaultProjection(obj);
            });

            describe('when projection is a non-empty string', () => {

                const projection = 'compact';

                it('performs serialization in given projection', () => {
                    const obj = deflate(user, { projection });
                    expect(obj).to.deep.equal(userCompactProjection);
                });

                describe('when fallback to default projection is disabled', () => {

                    it('doesn\'t fall back to default projection', () => {
                        const obj = deflate(user, { projection, fallbackToDefaultProjection: false });
                        expect(obj).to.deep.equal({
                            id: 1,
                            lv: timestamp.date.getTime()
                        });
                    });

                });

            });

        });

        describe('inflate', () => {

            function itDeserializesInDefaultProjection(instance: User) {
                it('performs deserialization in default projection', () => {
                    expect(instance).to.deep.equal(user);
                });
            }

            describe('when projection is undefined', () => {
                const instance = inflate(User, userDefaultProjection);
                itDeserializesInDefaultProjection(instance);
            });

            describe('when projection is set to undefined', () => {
                const instance = inflate(User, userDefaultProjection, { projection: undefined });
                itDeserializesInDefaultProjection(instance);
            });

            describe('when projection is null', () => {
                const instance = inflate(User, userDefaultProjection, { projection: null });
                itDeserializesInDefaultProjection(instance);
            });

            describe('when projection is set to empty string', () => {
                const instance = inflate(User, userDefaultProjection, { projection: '' });
                itDeserializesInDefaultProjection(instance);
            });

            describe('when projection is a non-empty string', () => {

                const projection = 'compact';

                it('performs deserialization in given projection', () => {
                    const instance = inflate(User, userCompactProjection, { projection });
                    expect(instance).to.deep.equal(user);
                });

                describe('when fallback to default projection is disabled', () => {

                    it('doesn\'t fallback to default projection', () => {
                        const instance = inflate(User, userCompactProjection, { projection, fallbackToDefaultProjection: false });
                        expect(instance).to.deep.equal({
                            identifier: 1,
                            lastVisit: timestamp
                        });
                    });

                });

            });

        });

    });

});
