import chai = require('chai');

import {
    BACKEND_NAME,
    Constructor,
    DEFAULT_PROJECTION,
    deflate,
    inflate,
    JsonType,
    MetadataManager,
    PropertyBagMetadata,
    Serialize
} from 'serialazy';

const { expect } = chai;

describe('"projection" option', () => {

    describe('when used with decorator', () => {

        const defaultProjection = MetadataManager.get(BACKEND_NAME, DEFAULT_PROJECTION);
        const testProjection = MetadataManager.get(BACKEND_NAME, 'test');

        describe('on a type', () => {

            interface Named {
                name: string;
            }

            const typeSerializer = {
                down: (named: Named) => named.name
            };

            function itAppliesInDefaultProjection(ctor: Constructor<Named>) {

                it('applies decorator in default projection', () => {
                    const { down } = defaultProjection.getOwnMetaFor(ctor.prototype).getTypeSerializer();
                    expect(down).to.equal(typeSerializer.down);
                    // tslint:disable-next-line: no-unused-expression
                    expect(testProjection.getOwnMetaFor(ctor.prototype)).to.not.exist;
                });

            }

            describe('when projection is undefined', () => {

                @Serialize(typeSerializer)
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to undefined', () => {

                @Serialize({ projection: undefined, ...typeSerializer })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to null', () => {

                @Serialize({ projection: null, ...typeSerializer })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is set to empty string', () => {

                @Serialize({ projection: '', ...typeSerializer })
                class Person implements Named {
                    public name: string;
                }

                itAppliesInDefaultProjection(Person);

            });

            describe('when projection is a non-empty string', () => {

                @Serialize({ projection: 'test', ...typeSerializer })
                class Person implements Named {
                    public name: string;
                }

                it('applies decorator in given projection', () => {
                    const { down } = testProjection.getOwnMetaFor(Person.prototype).getTypeSerializer();
                    expect(down).to.equal(typeSerializer.down);
                    // tslint:disable-next-line: no-unused-expression
                    expect(defaultProjection.getOwnMetaFor(Person.prototype)).to.not.exist;
                });

            });

        });

        describe('on a property', () => {

            describe('when projection is undefined/null or empty string', () => {

                class Person {

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
                    const meta = defaultProjection.getOwnMetaFor(Person.prototype) as PropertyBagMetadata;
                    expect(meta.propertySerializers.size).to.equal(4);
                    // tslint:disable-next-line: no-unused-expression
                    expect(testProjection.getOwnMetaFor(Person.prototype)).to.not.exist;
                });

            });

            describe('when projection is a non-empty string', () => {

                class Person {

                    @Serialize({ projection: 'test' })
                    public id: number;

                    @Serialize({ projection: 'test' })
                    public name: string;

                }

                it('applies decorator in given projection', () => {
                    const meta = testProjection.getOwnMetaFor(Person.prototype) as PropertyBagMetadata;
                    expect(meta.propertySerializers.size).to.equal(2);
                    // tslint:disable-next-line: no-unused-expression
                    expect(defaultProjection.getOwnMetaFor(Person.prototype)).to.not.exist;
                });

            });

        });

    });

    describe('when used with frontend function', () => {

        @Serialize({
            projection: '*',
            down: (ts: Timestamp) => ts.date.getTime(),
            up: (value: number) => new Timestamp(new Date(value))
        })
        class Timestamp {
            public constructor(
                public date: Date
            ) {}
        }

        class JWT {

            @Serialize()
            @Serialize({ projection: 'compact', name: 'sub' })
            public subject: string;

            @Serialize()
            @Serialize({ projection: 'compact', name: 'iat' })
            public issuedAt: Timestamp;

        }

        class User {

            @Serialize()
            @Serialize({ projection: 'compact' })
            public name: string;

            @Serialize()
            @Serialize({ projection: 'compact' })
            public jwt: JWT;

            @Serialize()
            @Serialize({ projection: 'compact', name: 'lv' })
            public lastVisit: Timestamp;

        }

        const timestamp = new Timestamp(new Date());

        const user = Object.assign(new User(), {
            name: 'John Doe',
            jwt: Object.assign(new JWT(), {
                subject: 'api',
                issuedAt: timestamp
            }),
            lastVisit: timestamp
        });

        const userDefaultProjection = {
            name: 'John Doe',
            jwt: {
                subject: 'api',
                issuedAt: timestamp.date.getTime()
            },
            lastVisit: timestamp.date.getTime()
        };

        const userCompactProjection = {
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

                it('performs serialization in given projection', () => {
                    const obj = deflate(user, { projection: 'compact' });
                    expect(obj).to.deep.equal(userCompactProjection);
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

                it('performs deserialization in given projection', () => {
                    const instance = inflate(User, userCompactProjection, { projection: 'compact' });
                    expect(instance).to.deep.equal(user);
                });

            });

        });

    });

});
