import { Constructor } from 'serialazy';

/** Generic serializable */
export default abstract class Serializable {

    public static create<T extends Serializable>(
        this: Constructor<T>,
        fields?: T
    ): T {
        return Object.assign(new this(), fields);
    }

}
