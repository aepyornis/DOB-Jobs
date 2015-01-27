var superagent = require('superagent');
var should = require('should');
var app = require('./app')

describe('gets index.html', function(){

 it('should get index.html', function(done){

  superagent.get('http://localhost:3000/')
    .end(function(e, res){
      should.not.exist(e);
      res.status.should.eql(200);
      done();
    })

 })

})

describe('sql_query_builder', function(){

  it('should produce correct statment', function(){

    var correctSQL = "SELECT house,streetname,bbl,latestactiondate,jobtype,existstories,proposedstories,ownername,ownerbusinessname,jobdescription FROM dob_jobs WHERE jobtype = 'A1' ORDER BY house asc"
    var correct_count = "SELECT COUNT (*) as c FROM dob_jobs WHERE jobtype = 'A1'";
    var appSQL = app.sql_query_builder(sample_request)[0];
    var app_count = app.sql_query_builder(sample_request)[1];
    appSQL.should.eql(correctSQL);
    app_count.should.eql(correct_count);
    
  })
})

  var sample_request = { 
    draw: '1',
  'columns[0][data]': 'house',
  'columns[0][name]': '',
  'columns[0][searchable]': 'true',
  'columns[0][orderable]': 'true',
  'columns[0][search][value]': '',
  'columns[0][search][regex]': 'false',
  'columns[1][data]': 'streetname',
  'columns[1][name]': '',
  'columns[1][searchable]': 'true',
  'columns[1][orderable]': 'true',
  'columns[1][search][value]': '',
  'columns[1][search][regex]': 'false',
  'columns[2][data]': 'bbl',
  'columns[2][name]': '',
  'columns[2][searchable]': 'true',
  'columns[2][orderable]': 'true',
  'columns[2][search][value]': '',
  'columns[2][search][regex]': 'false',
  'columns[3][data]': 'latestactiondate',
  'columns[3][name]': '',
  'columns[3][searchable]': 'true',
  'columns[3][orderable]': 'true',
  'columns[3][search][value]': '',
  'columns[3][search][regex]': 'false',
  'columns[4][data]': 'jobtype',
  'columns[4][name]': '',
  'columns[4][searchable]': 'true',
  'columns[4][orderable]': 'true',
  'columns[4][search][value]': 'A1',
  'columns[4][search][regex]': 'false',
  'columns[5][data]': 'existstories',
  'columns[5][name]': '',
  'columns[5][searchable]': 'true',
  'columns[5][orderable]': 'true',
  'columns[5][search][value]': '',
  'columns[5][search][regex]': 'false',
  'columns[6][data]': 'proposedstories',
  'columns[6][name]': '',
  'columns[6][searchable]': 'true',
  'columns[6][orderable]': 'true',
  'columns[6][search][value]': '',
  'columns[6][search][regex]': 'false',
  'columns[7][data]': 'ownername',
  'columns[7][name]': '',
  'columns[7][searchable]': 'true',
  'columns[7][orderable]': 'true',
  'columns[7][search][value]': '',
  'columns[7][search][regex]': 'false',
  'columns[8][data]': 'ownerbusinessname',
  'columns[8][name]': '',
  'columns[8][searchable]': 'true',
  'columns[8][orderable]': 'true',
  'columns[8][search][value]': '',
  'columns[8][search][regex]': 'false',
  'columns[9][data]': 'jobdescription',
  'columns[9][name]': '',
  'columns[9][searchable]': 'true',
  'columns[9][orderable]': 'true',
  'columns[9][search][value]': '',
  'columns[9][search][regex]': 'false',
  'order[0][column]': '0',
  'order[0][dir]': 'asc',
  start: '0',
  length: '10',
  'search[value]': '',
  'search[regex]': 'false' };
