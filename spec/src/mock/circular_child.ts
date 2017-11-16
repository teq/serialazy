import { Serialize } from '../../../';

import Parent from './circular_parent';

export default class Child {
    @Serialize({ optional: true }) public parent: Parent;
}
