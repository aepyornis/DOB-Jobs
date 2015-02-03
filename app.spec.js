var superagent = require('superagent');
var s = require('underscore.string')
var should = require('should');
var app = require('./app');
var squel = require('squel');

describe('gets index.html', function(){

 it('should get index.html', function(done){

  superagent.get('http://localhost:3000/')
    .end(function(e, res){
      (e === null).should.be.true;
      res.status.should.eql(200);
      done();
    })

 })

})

describe('where_exp', function(){

  it('should produce correct where statement', function(){

    var where = squel.select()
      .from('dob_jobs')
      .where(app.where_exp(dt))
      .toString();

    where.should.eql("SELECT * FROM dob_jobs WHERE (streetname LIKE '%LLC%' OR bbl LIKE '%LLC%' AND house = 10 AND streetname LIKE '%HENRY%')")

  })


})


var dt = { columns:
   [ { data: 'house',
       name: '',
       searchable: 'false',
       orderable: 'true',
       searchValue: '10',
       searchRegex: 'false' },
     { data: 'streetname',
       name: '',
       searchable: 'true',
       orderable: 'true',
       searchValue: 'HENRY',
       searchRegex: 'false' },
     { data: 'bbl',
       name: '',
       searchable: 'true',
       orderable: 'true',
       searchValue: '',
       searchRegex: 'false' } ],
  orders:
   [ { columnNum: '0',
       columnName: '',
       columnData: 'house',
       dir: 'asc' } ],
  draw: '1',
  start: '0',
  length: '10',
  search: 'LLC' };



var sample_request = { 
    draw: '1',
  'columns[0][data]': 'house',
  'columns[0][name]': '',
  'columns[0][searchable]': 'false',
  'columns[0][orderable]': 'true',
  'columns[0][search][value]': '20',
  'columns[0][search][regex]': 'false',
  'columns[1][data]': 'streetname',
  'columns[1][name]': 'HENRY',
  'columns[1][searchable]': 'true',
  'columns[1][orderable]': 'true',
  'columns[1][search][value]': '',
  'columns[1][search][regex]': 'false',
  'columns[2][data]': 'bbl',
  'columns[2][name]': '',
  'columns[2][searchable]': 'false',
  'columns[2][orderable]': 'true',
  'columns[2][search][value]': '',
  'columns[2][search][regex]': 'false',
  'columns[3][data]': 'ownerbusinessname',
  'columns[3][name]': '',
  'columns[3][searchable]': 'true',
  'columns[3][orderable]': 'true',
  'columns[3][search][value]': '',
  'columns[3][search][regex]': 'false',
  'order[0][column]': '2',
  'order[0][dir]': 'asc',
  start: '30',
  length: '10',
  'search[value]': 'LLC',
  'search[regex]': 'false' };