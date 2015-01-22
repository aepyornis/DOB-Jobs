//DOB excel data to postgres
//note: to use excel-parser python must be installed and you need to have these two python modules: argparse, xlrd run: pip install argparse & pip install xlrd
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var excelParser = require('excel-parser');
var pg = require('pg');
  pg.defaults.database = 'dobtest';
  pg.defaults.host = 'localhost';
  pg.defaults.user = 'mrbuttons';
  pg.defaults.password = 'mrbuttons';
  // pg.defaults.poolSize
//my modules
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
      //remove white space and commas
      var row = _.map(record, function(field ,i){ 
          var noCommas = removeCommas(field);
          return removeWhiteSpace(noCommas);
      });
      //add bbl
      row.push(bbl(row[2], parseInt(row[5]), parseInt(row[6])));
      
      var query = generate_sql_query(row);

      //push function to array for user with asnyc.parallel
      queries.push(function(callback){
         do_query(query, callback);
      })
    }
  })

  return queries;   
}

function generate_sql_query(row) {
    var fields_in_order = ['job','doc','borough','house','streetName','block','lot','bin','jobType','jobStatus','jobStatusDescrp','latestActionDate','buildingType','CB','cluster','landmark','adultEstab','loftBoard','cityOwned','littleE','PCFiled','eFiling','plumbing','mechanical','boiler','fuelBurning','fuelStorage','standPipe','sprinkler','fireAlarm','equipment','fireSuppresion','curbCut','other','otherDescript','applicantName','applicantTitle', 'professionalLicense','professionalCert','preFilingDate','paidDate','fullyPaidDate','assignedDate','approvedDate','fullyPermitted','initialCost','totalEstFee','feeStatus','existZoningSqft','proposedZoningSqft','horizontalEnlrgmt','verticalEnlrgmt','enlrgmtSqft','streetFrontage','existStories','proposedStories','existHeight','proposedHeight','existDwellUnits','proposedDwellUnits','existOccupancy','proposedOccupany','siteFill','zoneDist1','zoneDist2','zoneDist3','zoneSpecial1','zoneSpecial2','ownerType','nonProfit','ownerName','ownerBusinessName','ownerHouseStreet','ownerCityStateZip','ownerPhone','jobDescription','bbl']
    var column_names = [];
    var values = [];
    _.each(row, function(field, i){

        //get value of field
        var value = type_cast(field, i);
        //if it exists add it to the sql statement
        if (value) {
            column_names.push(fields_in_order[i]);
            values.push("'" + value + "'");
        }

    })
    var sql = "INSERT INTO dob_jobs (" + column_names.join() + ") VALUES (" + values.join() + ")";

    return sql;
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

function bbl(borough, block, lot) {
  var bor;
  var blk = '' + block;
  var lt = '' + lot;
  var bbl = '';

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
  } else { 
        bor = 'err'; 
        console.log("there's a mistake with the borough name: " + borough);
    }

  if (block != undefined && lot != undefined) {
    if (block.length > 5 || lot.length > 4) {
    console.log("the block and/or lot are too long")
    } else {
        while (blk.length !== 5) {
          blk = '0' + blk;
        }
        while (lt.length !== 4) {
          lt = '0' + lt;
        }
        bbl = bor + blk + lt;
    }
  } else {
    return 'err';
  } 

  return bbl;
}

function removeWhiteSpace(field) {
  if (typeof field === 'string') {
    return field.trim();
  } else {
    return field;
  }
}

function removeCommas ( str ) {
    if (typeof str === 'string') {
        return (str + '').replace(/[,]/g, '')
    } else {
        return str
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

function createDobTable(callback) {
    var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dobtest');
    do_some_SQL(client, sql.dobTable, function(result){
            client.end()
            typeof callback === 'function' && callback();
    }) 
}

//this function excutes sql
//used by createDobTable()
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

//testing
module.exports = {
    create_excel_files_arr: create_excel_files_arr,
    do_some_SQL: do_some_SQL,
    read_excel_file: read_excel_file,
    create_queries_array: create_queries_array
}