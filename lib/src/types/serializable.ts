import { Constructor } from './constructor';

/** Generic serializable */
export default abstract class Serializable {

    /**
     * Create new instance
     * @param fields Instance fields
     */
    public static create<T extends Serializable>(
        this: Constructor<T>,
        fields?: T
    ): T {
        return Object.assign(new this(), fields);
    }

}
