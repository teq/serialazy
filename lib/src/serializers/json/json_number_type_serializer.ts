import Constructor from '../../types/constructor';
import TypeSerializer from '../type_serializer';

function expectNumberOrNil(maybeNumber: any): number {
    if (typeof(maybeNumber) === 'number') {
        return maybeNumber;
    } else if (maybeNumber instanceof Number) {
        return maybeNumber.valueOf();
    } else if (maybeNumber === null || maybeNumber === undefined) {
        return maybeNumber;
    } else {
        throw new Error(`Not a number (typeof: "${typeof(maybeNumber)}", value: "${maybeNumber}")`);
    }
}

/** JSON serializer for numbers */
const jsonNumberTypeSerializer: TypeSerializer<any, number> = {
    down: (originalValue: any) => expectNumberOrNil(originalValue),
    up: (serializedValue: any) => expectNumberOrNil(serializedValue)
};

export default Object.assign(jsonNumberTypeSerializer, {
    matchValue: (value: any) => typeof(value) === 'number' || value instanceof Number,
    matchType: (type: Constructor<any>) => type === Number
});
