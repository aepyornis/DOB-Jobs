//node parse from excel to to postgres
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
//to use excel-parser python must be installed
//and you need to have these two python modules: argparse, xlrd. Do:
//pip install argparse
//pip install xlrd
var excelParser = require('excel-parser');
var pg = require('pg');
//default settings
    pg.defaults.database = 'dobtest';
    pg.defaults.host = 'localhost';
    pg.defaults.user = 'mrbuttons';
    // pg.defaults.poolSize
//my sql file
var sql = require('./sql');
var type_cast = require('./type_casting');

//connect to postgres
function main (){
    var filePath = '';
    var query_array;
    read_excel_file(filePath, function(records){
        query_array = create_queries_array(records);
        async.parallel(query_array, function(err){
            if (err) console.error(err);
            console.log('done!')
            pg.end();
        })
    })
}


function create_queries_array(records) {
    var queries = [];
    //records = [[],[]]
    //each record is an array containing all values in one excel row
    _.each(records, function(record, i){
        if (i > 2) {
            //type-cast & remove white space
            var row = _.map(record, function(field ,i){ 
                var update_field = removeWhiteSpace(field);
                update_field = type_cast(update_field, i)
                return update_field;
            });
            row.push(bbl(row[2], parseInt(row[5]), parseInt(row[6])));
            var query = "INSERT INTO dob_jobs ("
            
            _.each(row, function(row, i){

                
                
            })

            query += ")";
            console.log(query);
            //push function to array for user with asnyc.parallel
            queries.push(function(callback){
               do_query(query, callback);
            })
        }
    })

    return queries;   
}

function do_query(sql, whenDone) {
    pg.connect(function(err, client, done){
        if (err) {
            return console.error('error fetching client from pool', err)
        }
        client.query(sql, function(err, result){
            if (err) console.error('error executing query', err);
            done();
            whenDone();
        })
    })
}



//input: filePath of excel file
//callback(records)
//records is array of arrays
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
            // client.end();
            typeof callback === 'function' && callback(result);
        })
    })
}

function bbl(borough, block, lot) {
  var bor;
  var blk = block;
  var lt = lot;
  if (borough === 'MANHATTAN') {
    bor = '1';
  } else if (borough === 'BRONX') {
    bor = '2';
  } else if (borough === 'BROOKLYN') {
    bor = '3';
  } else if (borough === 'QUEENS') {
    bor = '4';
  } else if (borough === 'STATEN ISLAND') {
    bor = '5';
  } else { bor = 'err'; console.log("there's a mistake with the borough name: " + borough );}

  if (block != undefined || lot != undefined) {
    if (block.length > 5 || lot.length > 4) {
    console.log("the block and/or lot are too long")
    } else {
    while (blk.length < 5) {
      blk = '0' + blk;
    }
    while (lt.length < 4) {
      lt = '0' + lt;
    }
    return (bor + blk + lt);
    }
  } else {
    return 'undefined';
  } 
}

function removeWhiteSpace(field) {
  if (typeof field === 'string') {
    return field.trim();
  } else {
    return field;
  }
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
    read_excel_file: read_excel_file,
    create_queries_array: create_queries_array
}