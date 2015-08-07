// DOB excel data to postgres
// note: to use excel-parser python must be installed and you need to have these two python modules: argparse, xlrd run: pip install argparse & pip install xlrd
// to use as command line: 
// argv[2] = table_name 
// argv[3] = path to directory with excel files
// argv[4] = database
// argv[5] = user
// argv[6] = password
// argv[7] = host
// argv[8] = port

var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var excelParser = require('excel-parser');
var pg = require('pg');
  pg.defaults.database = process.argv[4] || 'dobtest';
  pg.defaults.host = process.argv[7] || 'localhost';
  pg.defaults.user = process.argv[5] || 'mrbuttons';
  pg.defaults.password = process.argv[6] || 'mrbuttons';
  // pg.defaults.poolSize
  if (process.argv[8]) {
    pg.defaults.port = process.argv[8];
  }

// name of table to add data to  
// FIX THIS LATER
var table_name = 'dobtest';
// var table_name = process.argv[2] || 'jobs_2015';
// path to excel files directory
var excel_dir = process.argv[3] || './data/2015';

//my modules
// var sql = require('./sql');
// var type_cast = require('./type_casting');

//error counter
var errors = 0;

//this function creates the table, if that's needed
// createDobTable(console.log('done'));

//the magic function that does everything
// insertAllTheFiles(excel_dir);

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

// takes records as nested arrays and returns array of functions that each insert one row in the database
// input: [[],[]]
// output [function, function]
function create_queries_array(records) {
  return  _.chain(records) // [[],[]]
    .slice(3)
    .map(cleanUp) 
    .map(toObjRepresentation) // [{}.{}]
    .map(prepareForDatabase)
    .map(addressAndBBL)
    .map(sqlStatments) // ['','']
    .map(insertFunction) // [function, function]
    .value()
}

// removes commas and white space, doubles '' 
function cleanUp (record){
  return _.map(record, function(field){
    var noCommas = removeCommas(field);
    var doubledUp = doubleUp(noCommas);
    return removeWhiteSpace(doubledUp);
  });
}

// converts to object representation of data
// [] -> {}
function toObjRepresentation(record){
  var lookup = require('./fieldmap')
  return _.reduce(record, function(memo, val, index){
    var addThisPair = {};
    addThisPair[lookup[index]] = val;
    return _.extend(memo, addThisPair);
  }, {})
}

// adds two new fields to the record: address and BBL
// {} -> {}
function addressAndBBL(record) {
  record.address = record.House + " " + record.StreetName
  record.BBL = bbl(record.Borough, record.Block, record.Lot)
  return record;
}

  
// prepares the data for inserting in to postgres
// {} -> {}
function prepareForDatabase(record) {
  return _.mapObject(record, function(val, key) {
    switch (key) {
      case "Job":
      case "Doc":
      case "House":
      case "Block":
      case "Lot":
      case "CommunityBoard":
      case "ApplicantLicense":
      case "OwnerPhone":
        return val.replace('.0', '')
        break;
      // booleans
      case "Cluster":
      case "Landmarked":
      case "AdultEstab":
      case "LoftBoard":
      case "CityOwned":
      case "Littlee":
      case "PCFiled":
      case "eFilingFiled":
      case "Plumbing":
      case "Mechanical":
      case "Boiler":
      case "FuelBurning":
      case "FuelStorage":
      case "Standpipe":
      case "Sprinkler":
      case "FireAlarm":
      case "Equipment":
      case "FireSuppression":
      case "CurbCut":
      case "Other":
      case "NonProfit":
      case "HorizontalEnlrgmt":
      case "VerticalEnlrgmt":
        if (val.trim()) {
          return "'t'"
        } else {
          return "'f'"
        }
        break;
      // dates
      case "LatestActionDate":
      case "PreFilingDate":
      case "Paid":
      case "FullyPaid":
      case "Assigned":
      case "Approved":
      case "FullyPermitted":
        return val.replace(/[ ]*00:00:00|0.0/g, '')
        break;
      default:
        return val;
        break; 
    }
  })

}
// input: {} -> str
// takes record and returns corresponding SQL query 
function sqlStatements(row) {
  var columnsAndvalues =  _.chain(row)
    .pick(function(val, key){
      if (val) {
        return true;
      } else {
        return false;
      }
    })
    .mapObject(function(val, key){
      // these fields WON'T be surrounded by single-quotes
      var numberKeys = ['ExistingZoningSqft', 'ProposedZoningSqft', 'EnlargementSQFootage',"StreetFrontage","ExistingNoofStories","ProposedNoofStories","ExistingHeight","ProposedHeight","ExistingDwellingUnits","ProposedDwellingUnits",'InitialCost', 'TotalEstFee']
      if (_.contains(numberKeys, key)) {
        return val;
      } else {
        return "'" + val + "'";
      }
    })
    .pairs()
    .unzip()
    .value();

  return "INSERT INTO " + table_name + " (" + columnsAndvalues[0].join() + ") VALUES (" + columnsAndvalues[1].join() + ")";
}

function insertFunction(query) {
  return function(callback) {
    do_query(query, callback)
  }
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
        whenDone(err, result);
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

// need to change table schema !

module.exports = {
  do_query: do_query,
  removeWhiteSpace: removeWhiteSpace,
  doubleUp: doubleUp,
  removeCommas: removeCommas,
  bbl: bbl,
  cleanUp: cleanUp,
  toObjRepresentation: toObjRepresentation,
  prepareForDatabase: prepareForDatabase,
  addressAndBBL: addressAndBBL,
  sqlStatements: sqlStatements,
  insertFunction: insertFunction

}