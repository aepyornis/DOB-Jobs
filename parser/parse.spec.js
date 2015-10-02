var fs = require('fs');
var should = require('should');
var parser = require('./parse');
var async = require('async');
var pg = require('pg');
var _ = require('underscore');
var sql = require('./sql');
//default settings
  pg.defaults.database = 'dobtest';
  pg.defaults.host = 'localhost';
  pg.defaults.user = 'mrbuttons';
  pg.defaults.password = 'mrbuttons';
  // pg.defaults.poolSize

var testRecords = JSON.parse(fs.readFileSync('./testrecords.json'));

describe('do_query', function(){
  it('should do a query', function(done){
    parser.do_query('SELECT NOW() As "theTime"', function(err, result){
      should(err).be.null
      result.rows.should.have.lengthOf(1)
      done()
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

describe('addressAndBBL', function(){
  it('should generate correct fields', function(){
    var record = parser.prepareForDatabase(parser.toObjRepresentation(parser.cleanUp(testRecords[3])));
    var recordPlus = parser.addressAndBBL(record);
    recordPlus.address.should.eql("250 WEST 30 STREET")
    recordPlus.BBL.should.eql('1007790069')
  })
})

describe('prepareForDatabase', function(){
  it('prepares the data for the database', function(){
    var record = parser.prepareForDatabase(parser.toObjRepresentation(parser.cleanUp(testRecords[4])));
    record.Job.should.eql('122208636')
    record.LatestActionDate.should.eql("2014-12-23")
    record.Landmarked.should.eql(false)
    record.Plumbing.should.eql(true)
    record.Assigned.should.eql('2014-12-02')
    record.ApplicantLicense.should.eql('26215')
    record.ZoningDist3.should.eql('')
    record.OtherDescription.should.eql('GEN. CONSTR.')
  })
})

describe('sqlStatements', function(){
  it('creates INSERT statment', function(){
    var test_record = parser.prepareForDatabase(parser.toObjRepresentation(parser.cleanUp(["122208636", "", "MANHATTAN", "328"])));
    parser.sqlStatements(test_record).should.eql("INSERT INTO dob_jobs (Job,Borough,House) VALUES ('122208636','MANHATTAN','328')");
  })
})

describe('read_excel_file', function(){
  this.timeout(10000)
  it('returns a nested array', function(done){
    parser.read_excel_file(__dirname + '/test.xls', function(records){
      _.isArray(records).should.be.true
      _.isArray(records[2]).should.be.true
      done()
    })
  })
})

describe('create_excel_files_arr', function(){
  it('only returns excel files', function(){
    parser.create_excel_files_arr('./').length.should.eql(2)
  })
})

describe('testing the test data(text.xls)', function(){
  this.timeout(40000)

  var parsed_records;

  before(function(done){
    parser.read_excel_file('test.xls', function(records){
      parsed_records = records;
      done()
    })
  })


  it('connection should work', function(done) {
    pg.connect(function(err, client, finished){
      should.not.exist(err)
      finished()
      done()
    })
  })

  it('should create the table', function(done){
    parser.do_query(sql.createTable, function(err, result){
      should.not.exist(err)
      done()
    })  
  })

  it('should excute all the functions in parallel', function(done){
     async.parallel(parser.create_queries_array(parsed_records),function(err){
      should.not.exist(err)
      done()
    })
  })

  it('should have 4 records', function(done){
    parser.do_query('SELECT * FROM dob_jobs', function(err, result){
      should.not.exist(err)
      result.rows.should.have.lengthOf(4);
      done();
    })
  })

  it('SELECT query recieves correct answers', function(done){
    parser.do_query("SELECT * from dob_jobs where Job = '122174100'", function(err, result){
      should.not.exist(err)
      result.rows.length.should.eql(1)
      result.rows[0].littlee.should.be.true
      result.rows[0].ownerbusinessname.should.eql('HENEGAN CONSTRUCTION')
      result.rows[0].zoningdist1.should.eql('M1-6D')
      should.not.exist(result.rows[0].zoningdist2)
      done();
    })
  })

  after(function(done){
    parser.do_query('DROP TABLE dob_jobs', function(err, result){
      done();
    })
  })

})

describe('testing job0312.xls', function(){
  this.timeout(40000)

  var parsed_records;

  before(function(done){
    parser.read_excel_file('job0312.xls', function(records){
      parsed_records = records
      done()
    })
  })

  before(function(done){
    parser.do_query(sql.createTable, function(err, result){
      if (err) console.error(err)
      done()
    })
  })

  it('should insert all the data', function(done){
    async.parallel(parser.create_queries_array(parsed_records),function(err){
      should.not.exist(err)
      done()
    })
  })

  it('db should contain all the records', function(done){
    parser.do_query('SELECT count(*) as c FROM dob_jobs', function(err, result){
      should.not.exist(err)
      result.rows[0].c.should.eql('7113')
      done()
    })
  })

  after(function(done){
    parser.do_query('DROP TABLE dob_jobs', function(err, result){
      done()
    })
  })
})

describe('test that it can insert multiple files from directory', function(){
  this.timeout(40000)

  before(function(done){
    parser.do_query(sql.createTable, function(err, result){
      if (err) console.error(err)
      done()
    })
  })

  before(function(done){
    parser.insertAllTheFiles(__dirname, function(){
      done()
    })  
  })

  it('db has correct number of rows', function(done){
    parser.do_query('SELECT count(*) as c FROM dob_jobs', function(err, result){
      should.not.exist(err)
      result.rows[0].c.should.eql('7117')
      done()
    })  
  })
}) 







