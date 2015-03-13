// DOB excel data to postgres
// note: to use excel-parser python must be installed and you need to have these two python modules: argparse, xlrd run: pip install argparse & pip install xlrd
// to use as command line: 
// argv[2] = table_name 
// argv[3] = path to directory with excel files
// argv[4] = database
// argv[5] = user
// argv[6] = password
// argv[7] = host

var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var excelParser = require('excel-parser');
var pg = require('pg');
  pg.defaults.database = process.argv[4] || 'dob';
  pg.defaults.host = process.argv[7] || 'localhost';
  pg.defaults.user = process.argv[5] || 'mrbuttons';
  pg.defaults.password = process.argv[6] || 'mrbuttons';
  // pg.defaults.poolSize

// name of table to add data to  
var table_name = process.argv[2] || 'jobs_2015';
// path to excel files directory
var excel_dir = process.argv[3] || './data/2015';

//my modules
var sql = require('./sql');
var type_cast = require('./type_casting');

//error counter
var errors = 0;
//this function creates the table, if that's needed
// createDobTable(console.log('done'));

//the magic function that does everything
insertAllTheFiles(excel_dir);

function insertAllTheFiles (dirPath) {

  var filePaths = create_excel_files_arr(dirPath);
  var arr_of_insert_functions = _.map(filePaths, function(filePath){
    return function(callback) {
      insertOneFile(filePath, callback);
    }
  });
  async.series(arr_of_insert_functions, function(err) {
    if (err) console.error(err);
    console.log('my god - they are done');
    console.log('total errors: ' + errors);
    pg.end();
  });

}

// creates an array of file paths for excel files in a give directory
function create_excel_files_arr(dirPath) {
  var allFiles = fs.readdirSync(dirPath);
  //remove any non excel files
  var onlyExcel = _.filter(allFiles, function(v){
      return (/(\.xls)$/.test(v))
  });
  return _.map(onlyExcel, function(filePath) {
    return dirPath + '/' + filePath;
  });
}

// inserts an excel file into the postgres db
function insertOneFile (filePath, callback){
  // parses an excel file
  read_excel_file(filePath, function(records){
      // iterates over the excel file's rows (multi-dimensional array) to create sql insert queries
      var query_array = create_queries_array(records);

      // excute the insert queries in parallel 
      async.parallel(query_array, function(err){
          if (err) console.error(err);
          console.log(filePath + ' is done!')
          callback(null);
      });
  });
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
    });
}


function create_queries_array(records) {
  var queries = [];
  //records = [[],[]]
  //each record is an array containing all values in one excel row
  _.each(records, function(record, i){
    // skip the first two rows
    if (i > 2) {
      //clean up data: remove white space, commas
      var row = _.map(record, function(field ,i){ 
          var noCommas = removeCommas(field);
          var doubledUp = doubleUp(noCommas);
          return removeWhiteSpace(doubledUp);
      });
      // add bbl number
      row.push(bbl(row[2], parseInt(row[5]), parseInt(row[6])));
      // add address
      row.push(createAddress(row[3], row[4]));
      
      var query = generate_sql_query(row);

      //push function to array for user with asnyc.parallel
      queries.push(function(callback){
         do_query(query, callback);
      });
    }
  });

  return queries;   
}

// creates the insert SQL statement, one row at a time
function generate_sql_query(row) {
    var column_names = [];
    var values = [];
    _.each(row, function(field, i){
      //get value of field
      var value = type_cast.cast(field, i);
      //if it exists add it to the sql statement
      if (value) {
          column_names.push(type_cast.fields[i]);
          values.push("'" + value + "'");
      }
    });

    var sql = "INSERT INTO " + table_name + " (" + column_names.join() + ") VALUES (" + values.join() + ")";

    return sql;
}

// runs the SQL query on the postgres data using the pg module
function do_query(sql, whenDone) {
  pg.connect(function(err, client, done){
    if (err) {
        return console.error('error fetching client from pool', err)
    }
    client.query(sql, function(err, result){
        if (err) {
          console.error('error executing query', err);
          errors += 1;
        }
        done();
        whenDone();
    });
  });
}

// Helper Functions....
// creates the bbl number
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
    console.log("the block and/or lot are too long");
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

function createAddress(house, streetname) {
  var strHouse = '' + house;
  return '' + strHouse.replace('.0', '') + ' ' + streetname
}

function removeWhiteSpace( field ) {
  if (typeof field === 'string') {
    return field.trim();
  } else {
    return field;
  }
}

function removeCommas ( str ) {
  if (typeof str === 'string') {
      return (str + '').replace(/[,]/g, '');
  } else {
      return str
  }     
}

function doubleUp ( str ) {
  if (typeof str === 'string') {
    return str.replace(/'/g, "''");
  } else {
    return str;
  }
}

// Use pg to create the table
function createDobTable(callback) {
  var client = new pg.Client();
  do_some_SQL(client, sql.dobTable, function(result){
      client.end();
      console.log('table created!');
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
// module.exports = {
//     create_excel_files_arr: create_excel_files_arr,
//     do_some_SQL: do_some_SQL,
//     read_excel_file: read_excel_file,
//     create_queries_array: create_queries_array,
//     doubleUp: doubleUp,
//     createAddress: createAddress
// };