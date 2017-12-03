import { Serialize } from '../@lib/serialazy';

import Parent from './circular_parent';

export default class Child {
    @Serialize({ optional: true }) public parent: Parent;
}
