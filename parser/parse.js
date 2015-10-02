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
var table_name = process.argv[2] || console.log('don\'t forget about the table name!');
// uncomment for testing:
table_name = 'dob_jobs';

// path to excel files directory
var excel_dir = process.argv[3] || console.log('needs excel_dir!');

//error counter
var errors = 0;

// the magic function that does everything! comment this when testing.
//insertAllTheFiles(excel_dir)

//takes a directory of excel files, parses the files and inserts the data into postgres.
// optional callback
function insertAllTheFiles (dirPath, callback) {
  var filePaths = create_excel_files_arr(dirPath);
  var arr_of_insert_functions = _.map(filePaths, function(filePath){
    return function(callback) {
      insertOneFile(filePath, callback);
    }
  });
  async.series(arr_of_insert_functions, function(err) {
    if (err) console.error(err);
    console.log("whoohoo it's finished!");
    console.log('total errors: ' + errors);
    pg.end();
    typeof callback === 'function' && callback(null);
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

// inserts an excel file into postgres
// input: filePath (str)
// output: callback(null)
// y2k bug: will produce wrong sourceyear for years before 2000. 
function insertOneFile (filePath, callback){
  // parses an excel file
  read_excel_file(filePath, function(records){
    // get year from filePath
    var sourceYear =  "20" +  /job[\d]{2}([\d]{2}).xls/g.exec(filePath)[1];
        // generate array of functions
    var query_array = create_queries_array(records, sourceYear);
      // execute the insert queries in parallel 
      async.parallel(query_array, function(err){
          if (err) console.error(err);
          console.log(filePath + ' is done!');
          callback(null);
      });
  });
}

// input: filePath (str) of excel file
// output: callback(records)
// records is array of arrays
function read_excel_file(filePath, callback){
  excelParser.parse({
      inFile: filePath,
      worksheet: 1,
      skipEmpty: false
  },function(err, records){
      if (err) console.error(err);
      typeof callback === 'function' && callback(records);
  });
}

// takes records and the source-year of the data;  returns an array of functions that each insert one row in the database
// input: [[],[]], 'str'
// output [function, function]
function create_queries_array(records, sourceYear) {
  // create  addYear function
  var addYear = addYearConstructor(sourceYear);
  return  _.chain(records) // [[],[]]
    .slice(3)
    .map(cleanUp)
    .map(toObjRepresentation) // [{}.{}]
    .map(prepareForDatabase)
    .map(addressAndBBL)
    .map(addYear)
    .map(sqlStatements) // ['','']
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
// the map can be found in fieldmap.js
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


// creates a function that up adds new sourceyear field to a record
// str -> function
function addYearConstructor(sourceyear) {
  return function (record){
    record.sourceyear = sourceyear;
    return record;
  };  
}

// prepares the data for postgres
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
      case "ProfessionalCert":
        if (val.trim()) {
          return true;
        } else {
          return false;
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
        return val.replace(/[ ]*00:00:00|0\.0/g, '')
        break;
      default:
        return val;
        break; 
    }
  })
}

// takes record and returns corresponding SQL query 
// input: {} -> str
function sqlStatements(row) {
  var columnsAndvalues =  _.chain(row)
    // falsy-values with not be inserted and will remain null in db
    .pick(function(val, key){
      if (val === 'n' || val === 'N') {
        return false;
      }
      else if (val) {
        return true;
      } else {
        return false;
      }
    }) 
    .mapObject(function(val, key){
      // these fields WON'T be surrounded by single-quotes
      var numberKeys = ['ExistingZoningSqft', 'ProposedZoningSqft', 'EnlargementSQFootage',"StreetFrontage","ExistingNoofStories","ProposedNoofStories","ExistingHeight","ProposedHeight","ExistingDwellingUnits","ProposedDwellingUnits",'InitialCost', 'TotalEstFee']
      var booleans = ["Cluster","Landmarked","AdultEstab","LoftBoard","CityOwned","Littlee",    "PCFiled",    "eFilingFiled",    "Plumbing",    "Mechanical",    "Boiler",    "FuelBurning",    "FuelStorage",    "Standpipe",    "Sprinkler",    "FireAlarm",    "Equipment",    "FireSuppression",    "CurbCut",    "Other", "ProfessionalCert",    "HorizontalEnlrgmt",    "VerticalEnlrgmt"]
      if (_.contains(_.union(numberKeys, booleans), key)) {
        return val;
      } else {
        return "'" + val + "'";
      }
    })
    .pairs()
    .unzip()
    .value();

  var sql =  "INSERT INTO " + table_name + " (" + columnsAndvalues[0].join() + ") VALUES (" + columnsAndvalues[1].join() + ")";
    return sql;
 }

function insertFunction(query) {
  return function(callback) {
    do_query(query, callback)
  }
}

// runs an SQL query, db settings are command-line args or global variables, see the top of the page.
// callback(err, results)
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
// input: str, int or str, int or str
// output: str
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

// exports for testing
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
  insertFunction: insertFunction,
  read_excel_file: read_excel_file,
  create_queries_array: create_queries_array,
  create_excel_files_arr: create_excel_files_arr,
  insertAllTheFiles: insertAllTheFiles,
  insertOneFile:  insertOneFile
}
