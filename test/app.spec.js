'use strict';

const should = require('should');
const squel = require('squel');
const app = require('../server/app');
const _ = require('lodash');
const fs = require('fs');
const request = require('superagent');

const testdata = (file) => JSON.parse(fs.readFileSync("test/testdata/" + file + ".json"));


describe('do_query', () => {
  it('returns a promise', () => {
    app.do_query('select now()').should.be.a.Promise();
  });
});

describe('fromFields', () => {

  /*
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

   */
  it('adds correct field for any provided string', ()=>{
    let query = squel.select().from('x');
    app.fromFields('corporateoverlord', query);
    query.toString().should.eql('SELECT corporateoverlord FROM x');
    });
});

describe('sql_query_builder', () => {
  const dt = testdata('initquery');
  
  it('returns an array with 2 elements: the query and count query as objects', () =>{
    let sql = app.sql_query_builder(dt);
    sql.should.have.length(2);
    sql[0].should.have.keys('text', 'values');
    sql[1].should.have.keys('text', 'values');
  });
  
  it('returns correct query for initial request', () => {
    let sql = app.sql_query_builder(dt);
    let result = require('./baseQuery')
          + "ORDER BY latestactiondate DESC NULLS LAST LIMIT 25";
    sql[0].text.should.eql(result);
    sql[0].values.should.have.length(0);
  });

  it('returns correct count query for initial request', () =>{
    let countSQL = "SELECT COUNT(*) as c FROM dobjobs";
    app.sql_query_builder(dt)[1].text.should.eql(countSQL);
    app.sql_query_builder(dt)[1].values.should.have.length(0);
  });

  it('adds bounds query when the map is visible', () => {
    let dtquery = _.cloneDeep(dt);
    dtquery.bounds = "-74.1,40.6,-73.7,40.8";
    dtquery.mapVisible = 'true';
    let result = require('./baseQuery')
          + "WHERE (( (lng_coord BETWEEN -74.1 AND -73.7) AND (lat_coord BETWEEN 40.6 AND 40.8) )) "
          + "ORDER BY latestactiondate DESC NULLS LAST LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('does not add ORDER BY when there is an empty order array', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.order = [];
    let result = require('./baseQuery')
          + "LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('can order by ASC', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.order[0].dir = 'asc';
    let result = require('./baseQuery')
          + "ORDER BY latestactiondate ASC NULLS LAST LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('orders approved column asc with nulls first', () => {
    let dtquery = _.cloneDeep(dt);

    dtquery.order[0] = {column: '7', dir: 'asc'};
    let result = require('./baseQuery')
          + "ORDER BY approved ASC NULLS FIRST LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('orders approved column desc with nulls last', () => {
    let dtquery = _.cloneDeep(dt);
    dtquery.order[0] = {column: '7', dir: 'desc'};
    let result = require('./baseQuery')
          + "ORDER BY approved DESC NULLS LAST LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('disables limit when false is passed as second argument', () => {
    let result = require('./baseQuery') + "ORDER BY latestactiondate DESC NULLS LAST";
    app.sql_query_builder(dt, false)[0].text.should.eql(result);
  });

  it('does limit and offset correctly', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.start = "100";
    dtquery.length = "30";
    let result = require('./baseQuery')
          + "ORDER BY latestactiondate DESC NULLS LAST LIMIT 30 OFFSET 100";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
  });

  it('calculates correct query containing wheres', () => {
    let dtquery = _.cloneDeep(dt);
    dtquery.columns[0].search.value = "123 Main Street";
    dtquery.columns[2].search.value = "204";
    dtquery.search.value = "thing";
    let localSearchResult = "address LIKE $6 AND communityboard = $7";
    let globalSearchResult = "ownername LIKE $1 OR ownersbusinessname LIKE $2 OR jobdescription LIKE $3 OR applicantname LIKE $4 OR bbl LIKE $5";
    let wheres = `(${globalSearchResult} AND ${localSearchResult})`;
    let result = require('./baseQuery') + "WHERE "
          + wheres +  " ORDER BY latestactiondate DESC NULLS LAST LIMIT 25";
    app.sql_query_builder(dtquery)[0].text.should.eql(result);
    app.sql_query_builder(dtquery)[0].values.should.have.length(7);
  });
  
  it('calculates correct count query containing wheres', () => {
    let dtquery = _.cloneDeep(dt);
    dtquery.columns[0].search.value = "123 Main Street";
    dtquery.columns[2].search.value = "204";
    dtquery.search.value = "thing";
    let localSearchResult = "address LIKE $6 AND communityboard = $7";
    let globalSearchResult = "ownername LIKE $1 OR ownersbusinessname LIKE $2 OR jobdescription LIKE $3 OR applicantname LIKE $4 OR bbl LIKE $5";
    let wheres = `(${globalSearchResult} AND ${localSearchResult})`;
    let result = "SELECT COUNT(*) as c FROM dobjobs WHERE " + wheres;
    app.sql_query_builder(dtquery)[1].text.should.eql(result);
    app.sql_query_builder(dtquery)[1].values.should.have.length(7);
  });
  
});

describe('where_exp', () =>{

  const dt = testdata('initquery');

  it('returns sql_exp object that evaluates to a blank str for requests that don\'t perform searches', () =>{
    app.where_exp(dt).should.be.instanceOf(Object);
    app.where_exp(dt).toString().should.eql('');
  });

  it('makes an expression with local searches', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.columns[0].search.value = "123 Main Street";
    dtquery.columns[2].search.value = "204";
    let result = "address LIKE '%123 MAIN STREET%' AND communityboard = 204";
    app.where_exp(dtquery).toString().should.eql(result);
  });

  it('makes an expression with global searches', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.search.value = "thing";
    let result = "ownername LIKE '%THING%' OR ownersbusinessname LIKE '%THING%' OR jobdescription LIKE '%THING%' OR applicantname LIKE '%THING%' OR bbl LIKE '%THING%'";
    app.where_exp(dtquery).toString().should.eql(result);
  });

  it('makes an expression with global and local searches', () =>{
    let dtquery = _.cloneDeep(dt);
    dtquery.columns[0].search.value = "123 Main Street";
    dtquery.columns[2].search.value = "204";
    dtquery.search.value = "thing";
    
    let localSearchResult = "address LIKE '%123 MAIN STREET%' AND communityboard = 204";
    let globalSearchResult = "ownername LIKE '%THING%' OR ownersbusinessname LIKE '%THING%' OR jobdescription LIKE '%THING%' OR applicantname LIKE '%THING%' OR bbl LIKE '%THING%'";
    let result = `${globalSearchResult} AND ${localSearchResult}`;
    app.where_exp(dtquery).toString().should.eql(result);
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

describe('sentence_capitalize', () => {
  it('capitalizes sample sentence', () =>{
    const sample = "I AM HERE. ARE YOU.";
    app.sentence_capitalize(sample).should.eql('I am here. Are you.');
  });
});

describe('change_row', () => {
  
  it('returns val is val is falsy', () =>{
    let row = {approved: null, x: 1234};
    should(row.approved).be.null();
  });

  it('retuns a formated date', ()=>{
    let r = {approved: new Date(2015, 11, 3)};
    app.change_row(r).approved.should.eql('12-3-2015');
  });
  
  it('titlizes owername & applicant name', () =>{
    let r = {ownername: 'EVIL LANDLORD', applicantname: 'ALICE THE CONTRACTOR'};
    app.change_row(r).ownername.should.eql('Evil Landlord');
    app.change_row(r).applicantname.should.eql('Alice The Contractor');
  });

});

describe('format_bor', ()=>{

  it('returns formated borough or undefined', ()=>{

    app.format_bor("MN").should.eql("Manhattan");
    app.format_bor("BX").should.eql("Bronx");
    app.format_bor("BK").should.eql("Brooklyn");
    app.format_bor("QN").should.eql("Queens");
    app.format_bor("SI").should.eql("Staten Island");
    should.not.exist(app.format_bor("XX"));
  });

});

describe('getTotalRecords', ()=>{
  
  it('returns a promise', ()=>{
    app.getTotalRecords().should.be.a.Promise();
    
  });

  it('returns a value greater than 200,000', (done) =>{
    app.getTotalRecords().done( (count) => {
      _.gt(_.toNumber(count), 200000).should.eql(true);
      done();
    });
  });

});

describe('/datatables', () =>{

  let response;

  before( done => {
    request.get(require('./datatablesGetUrl'))
      .end((err, res)=> {
        response = res;
        done();
      });
  });
  
  describe('response.body', () =>{
    it('returns object with correct shape', () =>{
      response.body.should.be.an.Object();
      response.body.data.should.be.an.Array();
      response.body.draw.should.exist;
      response.body.recordsTotal.should.exist;
      response.body.recordsFiltered.should.exist;
    });

    it('has correct number of records', ()=>{
      response.body.data.should.have.lengthOf(25);
    });
    
  });

});
