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

  it('has 2 documents in collection', function(done){
    db.collection('jobTest').count(function(err, count) {
      count.should.eql(2);
      done();
    });
  })

  describe('remove white space', function(){

    it('removed white space correctly in db', function(done){
      db.collection('jobTest').findOne({Job: 121810255}, function(err, job) {
        job.JobDescription.should.eql('STRUCTURAL PLANS FILED IN CONJUNCTION WITH ALT 1 APPLICATION # 121810255.');
        done();
      })
      
    })
    it('removed correctly in example', function(){
      var test = parser.removeWhiteSpace('  corp 32    ');
      test.should.eql('corp 32');
    })
  })

})