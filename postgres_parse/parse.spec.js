var fs = require('fs');
var should = require('should');
var parser = require('./parse');
var pg = require('pg');

describe('create_excel_files_arr', function(){

    it('removes none xls files and return array', function(){
        var excel_array = parser.create_excel_files_arr('../data');
        var array_length = excel_array.length;
        array_length.should.eql(12);
    })

})

describe('do_some_SQL', function(){

    it('should execute some SQL', function(done){
        var client = new pg.Client('postgres://mrbuttons@localhost/dob');
        parser.do_some_SQL(client, 'SELECT NOW() As "theTime"', function(result){
            var num_of_rows = result.rows.length;
            num_of_rows.should.eql(1)
            done()
        }) 
    })

})


