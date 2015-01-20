//node parse from excel to to postgres
var fs = require('fs');
// var XLS = require('xlsjs');
var pg = require('pg');
var excelParser = require('excel-parser');
//my module with sql
var sql = require('./sql');


//connect to postgres
function main (){
    //create postgres client
    var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dob');
}


function read_excel_file(filePath, callback){

    excelParser.parse({
        inFile: filePath,
        worksheet: 1,
        skipEmpty: false,
    },function(err, records){
        if (err) console.error(err);
        typeof callback === 'function' && callback(records);
    })

}

//this function excutes sql
function do_some_SQL (client, sql, callback) {

    client.connect(function(err){
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query(sql, function(err, result){
            if (err) {
                return console.error('query error', err)
            }
            //this disconnects from the database
            client.end();
            typeof callback === 'function' && callback(result);
        })
    })
}


function create_excel_files_arr(filePath) {
        var allFiles = fs.readdirSync(filePath);
        //remove any non excel files
        var onlyExcel = allFiles.filter(function(v){
            if (/(\.xls)$/.test(v)) {
                return v;
            }
        })
        return onlyExcel;
}




function createDobTable(client, callback) {
    do_some_SQL(client, sql.dobTable, callback);
}

// typeof callback === 'function' && callback();


module.exports = {
    create_excel_files_arr: create_excel_files_arr,
    do_some_SQL: do_some_SQL,
    read_excel_file: read_excel_file
}