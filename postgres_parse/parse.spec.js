var fs = require('fs');
var should = require('should');
var parser = require('./parse');

describe('create_excel_files_arr', function(){

    it('removes none xls files and return array', function(){
        var excel_array = parser.create_excel_files_arr('../data');
        var array_length = excel_array.length;
        array_length.should.eql(12);
    })

})

