var fs = require('fs');
var mongo = require('mongoskin');
// var _ = require('underscore');
var should = require('should');
var util = require('./util');

var db = mongo.db('mongodb://localhost:27017/test', {native_parser:true});

util.writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'test3', null);

// describe('writeCSV', function(){

//     it('works on three variables', function(){
//         util.writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'test3', null, function(){
//           var test_csv = fs.readFileSync('test3.txt').toString();
//           var lines = test_csv.split(/\n/);
//           lines[0].should.eql('BuildingType, ExistingStories, OwnerName');
//           lines[1].length.should.eql(3);
//         })
//     })

//     after(function(done){
//       // fs.unlink('test3.txt', function(err){
//         done();
//     })

// })