'use strict';

const should = require('should');
const squel = require('squel');
const app = require('../server/app');
const _ = require('lodash');
const fs = require('fs');
//const superagent = require('superagent');

const testdata = (file) => JSON.parse(fs.readFileSync("testdata/" + file + ".json"));

describe('do_query', () => {
  it('returns a promise', () => {
    app.do_query('select now()').should.be.a.Promise();
  });
});

describe('fromFields', () => {

  it('adds correct field to query for address', () => {
    let query = squel.select().from('x');
    app.fromFields('address', query);
    query.toString().should.eql("SELECT house || ' ' || streetname || ', ' || zip as address FROM x");
  });

  it('adds correct field to query for ownername', () =>{
    let query = squel.select().from('x');
    app.fromFields('ownername', query);
    query.toString().should.eql("SELECT ownersfirstname || ' ' || ownerslastname as ownername FROM x");
  });

  it('adds correct field to query for applicantname', () =>{
    let query = squel.select().from('x');
    app.fromFields('applicantname', query);
    query.toString().should.eql("SELECT applicantsfirstname || ' ' || applicantsfirstname as applicantname FROM x");
  });

  it('adds correct field for any provided string', ()=>{
    let query = squel.select().from('x');
    app.fromFields('corporateoverlord', query);
    query.toString().should.eql('SELECT corporateoverlord FROM x');
    });
});

describe('where_exp', () =>{

  const dt = testdata('initquery');

  it('returns sql_exp object that evaluates to a blank str for requests that don\'t perform searches', () =>{
    app.where_exp(dt).should.be.instanceOf(Object);
    app.where_exp(dt).toString().should.eql('');
  });

});


describe('local_search', () =>{

  const dt = testdata('initquery');

  it('returns undefined if column search value is a blank string', ()=>{
    let column = dt.columns[0];
    let x = squel.expr();
    (typeof app.local_search(x, column)).should.eql('undefined');
  });

  it('creates expression when search value is a number', () => {
    let column = _.cloneDeep(dt.columns[8]);
    column.search.value = "10";
    let x = squel.expr();
    app.local_search(x,column);
    x.toString().should.eql('existingnoofstories = 10');
  });

  it('creates expression when search value is a date with format mm/dd/yyyy', () => {
    let column = _.cloneDeep(dt.columns[1]) ;
    column.search.value = "02/09/2016";
    let x = squel.expr();
    app.local_search(x,column);
    x.toString().should.eql("latestactiondate = '2016/02/09'");
  });

  it('creates LIKE expression and capitalizes the text for any other string search value', () => {
    let column = _.cloneDeep(dt.columns[4]) ;
    column.search.value = "Mr. Bad Landlord";
    let x = squel.expr();
    app.local_search(x,column);
    x.toString().should.eql("ownername LIKE '%MR. BAD LANDLORD%'");
  });

});

describe('global_search', () =>{
  const dt = testdata('initquery');
  
  before(()=>{
    dt.search.value = "thing";
  });

  it('generates LIKE statement for provided column', () =>{
    let x = squel.expr();
    app.global_search(x,dt,'applicantname');
    x.toString().should.eql("applicantname LIKE '%THING%'");
  });

});

describe('boundsWhere', () =>{
  const dt = testdata('initquery');
  
  before(()=>{
    dt.bounds = "-74.1,40.6,-73.7,40.8";
  });

  it('returns a query that limits withint a lat/lng range', ()=>{
    let boundsQuery = "( (lng_coord BETWEEN -74.1 AND -73.7) AND (lat_coord BETWEEN 40.6 AND 40.8) )";
    app.boundsWhere(dt).should.eql(boundsQuery);    
  });

});
  
