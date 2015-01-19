var fs = require('fs');
var mongo = require('mongoskin');
var split = require('split')
var parser = require('./stream_run')
var should = require('should');

var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});

describe('putInMongo', function(){

  before(function(done) {
    parser.putInMongo('test.csv', 'jobTest', function(){
      done();
    });
  })

  it('has 3 documents in collection', function(done){
    db.collection('jobTest').count(function(err, count) {
      count.should.eql(3);
      done();
    });
  })

  describe('remove white space', function(){

    it('removed white space correctly in db', function(done){
      db.collection('jobTest').findOne({Job: 121235252}, function(err, job) {
        job.JobDescription.should.eql('FILING HEREWITH MECHANICAL AND PLUMBING WORK IN CONJUNCTION WITH VERTICAL ENLARGEMENT AND RENOVATION.');
        done();
      })
      
    })
    it('removed correctly in example', function(){
      var test = parser.removeWhiteSpace('  corp 32    ');
      test.should.eql('corp 32');
    })

    it('keeps a number a number', function(){
      var test  = parser.removeWhiteSpace(4352);
      test.should.eql(4352);
    })
  })

})

describe('escapeCommas', function(){

  it('adds slashses', function(){

    parser.escapeCommas('DUMBO HOTEL, LLC').should.eql('DUMBO HOTEL\, LLC');
    parser.escapeCommas(',,,').should.eql('\,\,\,');

  })
})