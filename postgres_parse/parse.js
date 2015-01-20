//node parse from excel to to postgres
var fs = require('fs');
var XLS = require('xlsjs');
var pg = require('pg');


//connect to postgres
var client = new pg.Client('postgres://mrbuttons@localhost/dob');

do_some_SQL('SELECT NOW() As "theTime"', function(result){
    console.log(result.rows[0]);
});

//this function excutes sql
function do_some_SQL (sql, callback) {
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
            callback(result);
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










module.exports = {
    create_excel_files_arr: create_excel_files_arr
}