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

import Serializable from './serializable';

const { expect } = chai;

describe('projection options', () => {

    describe('when applied to decorator', () => {

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
                    const { down } = defaultProjection.getOwnMetaFor(ctor.prototype).getTypeSerializer(false);
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
                    const { down } = testProjection.getOwnMetaFor(Person.prototype).getTypeSerializer(false);
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

    describe('when applied to serialize/deserialize functions', () => {

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

            @Serialize()
            @Serialize({ projection: 'compact', name: 'sub' })
            public subject: string;

            @Serialize()
            @Serialize({ projection: 'compact', name: 'iat' })
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
                subject: 'api',
                issuedAt: timestamp.date.toISOString()
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
