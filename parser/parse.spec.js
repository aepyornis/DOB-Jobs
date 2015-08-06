var fs = require('fs');
var should = require('should');
var parser = require('./parse');
var async = require('async');
var pg = require('pg');
var type_cast = require('./type_casting');
//default settings
  pg.defaults.database = 'dobtest';
  pg.defaults.host = 'localhost';
  pg.defaults.user = 'mrbuttons';
  pg.defaults.password = 'mrbuttons'
  // pg.defaults.poolSize

var testRecords = JSON.parse(fs.readFileSync('./testrecords.json'));


describe('do_query', function(){
  it('should do a query', function(done){
    parser.do_query('SELECT NOW() As "theTime"', function(err, result){
      should(err).be.null;
      result.rows.should.have.lengthOf(1);
      done();
    })
  })
})

describe('removeWhiteSpace', function(){
  it('should remove white space', function(){
    parser.removeWhiteSpace(' is it gone?  ').should.eql('is it gone?')
  })
})

describe('doubleUp', function(){
  it('should double the apostrophes', function(){
    parser.doubleUp("her's").should.eql("her''s")
    parser.doubleUp("her's, jenny's").should.eql("her''s, jenny''s")
  })
})

describe('removeCommas', function(){
  it('should remove commas, duh', function(){
    parser.removeCommas('remove, those, commas').should.eql('remove those commas')
  })
})

describe('bbl', function(){
  it('should correctly create bbls', function(){
    parser.bbl('BRONX', '33', '765').should.eql('2000330765')
  })
})

describe('cleanUp', function(){
  it('should remove white space, commas, and double apostrophes', function(){
    var test_record = [ "62.0  ","  1057289.0 ","A'1","J","P/E, DISAPPROVED  "]
    parser.cleanUp(test_record).should.eql([ "62.0","1057289.0","A''1","J","P/E DISAPPROVED"])
  })
})

describe('toObjRepresentation', function(){
  it('should turn into an object', function(){
    var test_record = ["122208636", "2", "MANHATTAN", "328"]
    var as_an_object = {
      "Job": "122208636",
      "Doc": "2",
      "Borough": "MANHATTAN",
      "House": "328"
    }
    parser.toObjRepresentation(test_record).should.eql(as_an_object);
  })
})

