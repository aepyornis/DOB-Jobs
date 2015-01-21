var fs = require('fs');
var should = require('should');
var parser = require('./parse');
var async = require('async');
var pg = require('pg');

describe('create_excel_files_arr', function(){

    it('removes non-xls files and returns array', function(){
        var excel_array = parser.create_excel_files_arr('../data');
        var array_length = excel_array.length;
        array_length.should.eql(12);
    })

})

describe('do_some_SQL', function(){

    it('should execute some SQL', function(done){
        var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dob');
        parser.do_some_SQL(client, 'SELECT NOW() As "theTime"', function(result){
            var num_of_rows = result.rows.length;
            num_of_rows.should.eql(1)
            client.end()
            done()
        }) 
    })

})

describe('read_excel_file', function(){

    it('should be an array', function(done) {
        parser.read_excel_file('test.xls', function(records){
            records.should.be.an.Array.and.an.Object;
            done();
        })
    })
})

describe('the whole damn thing', function(){
    this.timeout(20000);
    var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dob');    
    var excel_records;
    var query_array;

    it('should read excel file', function(done){
        parser.read_excel_file('test.xls', function(records){
            records.should.be.an.Array.and.an.Object;
            excel_records = records;
            done();
        })
    })

    it('should create an array of functions that executes queires', function(){
            query_array = parser.create_queries_array(excel_records, client);
            query_array.should.have.lengthOf(4);
    })

    it('should insert them into postgres', function(done){

        async.parallel(query_array, function(err) {
            if (err) console.log(err);
            should.not.exist(err);
            done();
        })

    })

    it('postgres should have the records', function(done){

        var testSQL = 'SELECT * FROM dob_jobs';

        parser.do_some_SQL(client, testSQL, function(err, result){

            should.not.exist(err);
            result.rows.should.be.an.Array.and.an.Object;
            result.rows.should.have.lengthOf(4);
            done();

        })

    })

})



