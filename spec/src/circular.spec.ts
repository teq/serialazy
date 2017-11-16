import chai = require('chai');

const { expect } = chai;

describe('circular dependencies and references', () => {

    it('can handle circular dependencies between node modules', () => {

        expect(() => require('./mock/circular_parent')).to.not.throw();

    });

});
