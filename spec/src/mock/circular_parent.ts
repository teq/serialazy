import { Serializable } from '../@lib/serialazy_json';

import Child from './circular_child';

export default class Parent {
    @Serializable.Prop() public child: Child;
}
