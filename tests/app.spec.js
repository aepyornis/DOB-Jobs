const should = require('should');
const squel = require('squel');
const app = require('../server/app');
//const superagent = require('superagent');

describe('do_query', () => {
  it('returns a promise', () => {
    app.do_query('select now()').should.be.a.Promise();
  });
});

describe('fromFields', () => {

});
