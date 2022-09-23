import chai = require('chai');

import { deflate, inflate, Serializable, Serialize } from 'serialazy';

const { expect } = chai;

function randDefer<T>(value: T): Promise<T> {
    const pause = Math.random() * 100;
    return new Promise((resolve) => setTimeout(() => resolve(value), pause));
}

function isPromise<T = unknown>(target: unknown): target is Promise<T> {
    return Promise.resolve(target) === target;
}

describe('promise resolving', () => {

    const posSerializer = {
        down: (pos: Position) => `${pos.x},${pos.y}`,
        up: (str: string) => {
            const match = str.match(/^(\d+),(\d+)$/);
            if (!match) { throw new Error(`Invalid point: ${str}`); }
            const [, xStr, yStr] = match;
            return Position.create({ x: Number.parseInt(xStr), y: Number.parseInt(yStr) });
        }
    };

    const tagsSerializer = {
        down: (tags: string[]) => tags.join(','),
        up: (str: string) => str.split(',')
    };

    @Serialize(posSerializer)
    class Position extends Serializable {
        public x: number;
        public y: number;
    }

    class Particle extends Serializable {
        @Serialize()
        public position: Position;
        @Serialize(tagsSerializer)
        public tags: string[];
    }

    @Serialize({
        down: (pos: Position) => randDefer(posSerializer.down(pos)),
        up: (str: string) => randDefer(posSerializer.up(str))
    })
    class PositionAsync extends Serializable {
        public x: number;
        public y: number;
    }

    class ParticleAsync extends Serializable {
        @Serialize()
        public position: Position;
        @Serialize({
            down: (tags: string[]) => randDefer(tagsSerializer.down(tags)),
            up: (str: string) => randDefer(tagsSerializer.up(str))
        })
        public tags: string[];
    }


    context('when type serializes to a non-promise value', () => {

        const pos = Position.create({ x: 10, y: 20 });
        const posSerialized = '10,20';

        context('when used with resolve', () => {

            it('should return a promise', async () => {
                const serialazedPromise = deflate.resolve(pos);
                expect(isPromise(serialazedPromise)).to.equal(true);
                const serialized = await serialazedPromise;
                expect(serialized).to.equal(posSerialized);
                const deserializedPromise = inflate.resolve(Position, serialized);
                expect(isPromise(deserializedPromise)).to.equal(true);
                const deserialized = await deserializedPromise;
                expect(deserialized).to.deep.equal(pos);
            });

        });

        context('when used w/o resolve', () => {

            it('should return a non-promise value', () => {
                const serialized = deflate(pos) as any;
                expect(isPromise(serialized)).to.equal(false);
                expect(serialized).to.equal(posSerialized);
                const deserialized = inflate(Position, serialized);
                expect(isPromise(deserialized)).to.equal(false);
                expect(deserialized).to.deep.equal(pos);
            });

        });

    });

    context('when type serializes to a promise', () => {

        const pos = PositionAsync.create({ x: 10, y: 20 });
        const posSerialized = '10,20';

        context('when used with resolve', () => {

            it('should return a promise', async () => {
                const serialazedPromise = deflate.resolve(pos);
                expect(isPromise(serialazedPromise)).to.equal(true);
                const serialized = await serialazedPromise;
                expect(serialized).to.equal(posSerialized);
                const deserializedPromise = inflate.resolve(PositionAsync, serialized);
                expect(isPromise(deserializedPromise)).to.equal(true);
                const deserialized = await deserializedPromise;
                expect(deserialized).to.deep.equal(pos);
            });

        });

        context('when used w/o resolve', () => {

            it('should throw an error', () => {
                expect(() => deflate(pos)).to.throw('should be serialized with "deflate.resolve"');
                expect(() => inflate(PositionAsync, posSerialized)).to.throw('should be deserialized with "inflate.resolve"');
            });

        });

    });

    context('when property-bag doesn\'t contain props serializing to promises', () => {

        const part = Particle.create({
            position: Position.create({ x: 20, y: 30 }),
            tags: ['one', 'two']
        });
        const partSerialized = {
            position: '20,30',
            tags: 'one,two'
        };

        context('when used with resolve', () => {

            it('should return a promise', async () => {
                const serialazedPromise = deflate.resolve(part);
                expect(isPromise(serialazedPromise)).to.equal(true);
                const serialized = await serialazedPromise;
                expect(serialized).to.deep.equal(partSerialized);
                const deserializedPromise = inflate.resolve(Particle, serialized);
                expect(isPromise(deserializedPromise)).to.equal(true);
                const deserialized = await deserializedPromise;
                expect(deserialized).to.deep.equal(part);
            });

        });

        context('when used w/o resolve', () => {

            it('should return a non-promise value', () => {
                const serialized = deflate(part) as any;
                expect(isPromise(serialized)).to.equal(false);
                expect(serialized).to.deep.equal(partSerialized);
                const deserialized = inflate(Particle, serialized);
                expect(isPromise(deserialized)).to.equal(false);
                expect(deserialized).to.deep.equal(part);
            });

        });

    });

    context('when property-bag contains props serializing to promises', () => {

        const part = ParticleAsync.create({
            position: PositionAsync.create({ x: 20, y: 30 }),
            tags: ['one', 'two']
        });
        const partSerialized = {
            position: '20,30',
            tags: 'one,two'
        };

        context('when used with resolve', () => {

            it('should return a promise', async () => {
                const serialazedPromise = deflate.resolve(part);
                expect(isPromise(serialazedPromise)).to.equal(true);
                const serialized = await serialazedPromise;
                expect(serialized).to.deep.equal(partSerialized);
                const deserializedPromise = inflate.resolve(ParticleAsync, serialized);
                expect(isPromise(deserializedPromise)).to.equal(true);
                const deserialized = await deserializedPromise;
                expect(deserialized).to.deep.equal(part);
            });

        });

        context('when used w/o resolve', () => {

            it('should throw an error', () => {
                expect(() => deflate(part)).to.throw('should be serialized with "deflate.resolve"');
                expect(() => inflate(ParticleAsync, partSerialized)).to.throw('should be deserialized with "inflate.resolve"');
            });

        });

    });

});
