import { Serialize } from '../@lib/serialazy';

import Child from './circular_child';

export default class Parent {
    @Serialize() public child: Child;
}
