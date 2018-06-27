import { Serializable } from '../@lib/serialazy_json';

import Parent from './circular_parent';

export default class Child {
    @Serializable.Prop({ optional: true }) public parent: Parent;
}
