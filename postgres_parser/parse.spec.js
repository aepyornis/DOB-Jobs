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

describe('createAddress', function(){

  it('works with example', function() {
    parser.createAddress(14.0, 'ASTORIA BLVD').should.eql('14 ASTORIA BLVD');
    parser.createAddress('2', 'ASTORIA BLVD').should.eql('2 ASTORIA BLVD');
  })
})



describe('the whole damn thing', function(){
  this.timeout(10000)
  var parsed_records;
  var query_function_array;

    before(function(done){
            parser.read_excel_file('test.xls', function(records){
            parsed_records = records;
            done();
        })
    })

    it('connection should work', function(done) {
        pg.connect(function(err, client, finished){
            should.not.exist(err)
            finished()
            done()
        })
    })

    it('should read excel file', function(){
        parsed_records.should.be.an.Array.and.an.Object;
        parsed_records.should.have.lengthOf(7);
        parsed_records[4].should.have.lengthOf[75];

    })

    it('should create an array of functions that executes queries', function(){

        query_function_array = parser.create_queries_array(parsed_records);
        query_function_array.should.have.lengthOf(4);

    })

    describe('insert into db', function(){

      before(function(done){
        async.parallel(query_function_array, function(err){
            if (err) console.error(err);
            console.log('done!')
            done()
        })
      })

      it('should have the records', function(done){
        pg.connect(function(err, client, finished){
          should.not.exist(err);
          client.query('SELECT * FROM dob_jobs', function(err, result){
              should.not.exist(err);
              result.rows.should.have.lengthOf(4);
              finished();
              done();
          })
        })
      })
    })

    //remove the documents after the test
    after(function(){
      pg.connect(function(err, client, finished){
        client.query('TRUNCATE TABLE dob_jobs', function(err, result){
            finished();
            pg.end();
        })
      })  
    })

})

describe('create_excel_files_arr', function(){

  it('removes non-xls files and returns array', function(){
    var excel_array = parser.create_excel_files_arr('../data');
    excel_array.should.have.lengthOf(12);
  })

})

describe('do_some_SQL', function(){

  it('should execute some SQL', function(done){
    var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dobtest');
    parser.do_some_SQL(client, 'SELECT NOW() As "theTime"', function(result){
        result.rows.should.have.lengthOf(1)
        client.end()
        done()
    }) 
  })

})

describe('read_excel_file', function(){
  this.timeout(10000)
  it('should be an array', function(done) {
      parser.read_excel_file('test.xls', function(records){
          records.should.be.an.Array.and.an.Object;
          done();
      })
  })
})

describe('type_cast', function(){

    it('should work with integers', function(){
        type_cast('34', 1).should.eql(34)
        type_cast('122208789.0', 0).should.eql(122208789);
    })

    it('should work with booleans', function(){
        type_cast('', 20).should.eql('false');
        type_cast(null, 20).should.eql('false');
        type_cast('Y', 20).should.eql('true');
        type_cast('X', 20).should.eql('true');
    })

    it('should work with varchar()', function(){
        type_cast('lessThan15', 2).should.eql('lessThan15');
        type_cast('this is more than 15', 2).should.eql('this is more th');
    })

    it('should work with date', function(){
        type_cast('2014-12-01 00:00:00', 11).should.eql('2014-12-01');
        type_cast('', 11).should.be.false
        type_cast(0, 11).should.be.false
        type_cast('0', 11).should.be.false
    })
})


describe('doubleUp', function(){

  it('should double the apostrophes', function(){
    parser.doubleUp("her's").should.eql("her''s")
    parser.doubleUp("her's, jenny's").should.eql("her''s, jenny''s")
  })

})