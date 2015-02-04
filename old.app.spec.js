var superagent = require('superagent');
var s = require = require('underscore.string')
var should = require('should');
// var app = require('./new_app')

// describe('gets index.html', function(){

//  it('should get index.html', function(done){

//   superagent.get('http://localhost:3000/')
//     .end(function(e, res){
//       should.not.exist(e);
//       res.status.should.eql(200);
//       done();
//     })

//  })

// })






// it('should work with no values', function(){
//   var local_wheres = [];
//   var local_wheres_values = [];
//   var field_name = 'columns[5][data]';
//   range_numbers('-yadcf_delim-', sample_request, 'columns[5][data]', local_wheres, local_wheres_values);
//   // local_wheres.should.eql([]);
// })

// it('should work with low value', function(){
//   var local_wheres = [];
//   var local_wheres_values = [];
//   var field_name = 'columns[5][data]';
//   range_numbers('3-yadcf_delim-', sample_request, field_name, local_wheres, local_wheres_values);
//   local_wheres.should.have.lengthOf(1);
//   local_wheres_values.should.eql([3]);

// })

// it('should work with high value', function(){
//   var local_wheres = [];
//   var local_wheres_values = [];
//   var field_name = 'columns[5][data]';
//   range_numbers('-yadcf_delim-25', sample_request, field_name, local_wheres, local_wheres_values);
//   local_wheres.should.have.lengthOf(1);
//   local_wheres_values.should.eql([25]);

// })


// it('should work with bpth', function(){
//   var local_wheres = [];
//   var local_wheres_values = [];
//   var field_name = 'columns[5][data]';
//   range_numbers('3-yadcf_delim-7', sample_request, field_name, local_wheres, local_wheres_values);
//   local_wheres.should.eql(['existstories BETWEEN ? AND ?']);
//   local_wheres_values.should.eql([3,7]);

// })


// function range_numbers(value, obj, field_name, local_wheres, local_wheres_values) {
//   var low_value = /(\d*)-yadcf_delim-(\d*)/.exec(value)[1]
//   var high_value = /(\d*)-yadcf_delim-(\d*)/.exec(value)[2];

//   if (s.isBlank(low_value) && s.isBlank(high_value)) {
//     //if both blank, do nothing
//     return;
//   } else if (s.isBlank(low_value) && high_value) {
//     //no low_value, yes high_value
//     var local_where = obj[field_name] + " <= ?";
//     local_wheres.push(local_where);
//     local_wheres_values.push(s.toNumber(high_value));
//   } else if (low_value && s.isBlank(high_value)) {
//     // yes low_value, no high_value.
//     var local_where = obj[field_name] + " >= ?";
//     local_wheres.push(local_where);
//     local_wheres_values.push(s.toNumber(low_value));
//   } else if (low_value && high_value) {
//     //both low and high
//     var local_where = obj[field_name] + " BETWEEN ? AND ?";
//     local_wheres.push(local_where);
//     local_wheres_values.push(s.toNumber(low_value));
//     local_wheres_values.push(s.toNumber(high_value));
//   } else {
//     console.error("issues with number-range-input: " + key);
//   }
// }


// })




// describe('sql_query_builder', function(){

//   it('should produce correct statment', function(){

//     var correctSQL = "SELECT house,streetname,bbl,latestactiondate,jobtype,existstories,proposedstories,ownername,ownerbusinessname,jobdescription FROM dob_jobs WHERE jobtype = 'A1'  ORDER BY house asc LIMIT 10 OFFSET 30"
//     var correct_count = "SELECT COUNT (*) as c FROM dob_jobs WHERE jobtype = 'A1' ";
//     var appSQL = app.sql_query_builder(sample_request)[0];
//     var app_count = app.sql_query_builder(sample_request)[1];
//     appSQL.should.eql(correctSQL);
//     app_count.should.eql(correct_count);
    
//   })

//   it('should work with small request', function(){

//     var correctSQL = "SELECT house,streetname,bbl,ownerbusinessname FROM dob_jobs WHERE house LIKE '%LLC%' OR streetname LIKE '%LLC%' OR bbl LIKE '%LLC%' OR ownerbusinessname LIKE '%LLC%' AND house = '20'  ORDER BY bbl asc LIMIT 10 OFFSET 30";
//     var appSQL = app.sql_query_builder(small_sample_request)[0];
//     appSQL.should.eql(correctSQL);


//   })

// })

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
  start: '30',
  length: '10',
  'search[value]': '',
  'search[regex]': 'false' };


var small_sample_request = { 
    draw: '1',
  'columns[0][data]': 'house',
  'columns[0][name]': '',
  'columns[0][searchable]': 'true',
  'columns[0][orderable]': 'true',
  'columns[0][search][value]': '20',
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
