var XLS = require('xlsjs');
var fs = require('fs');
var async = require('async');


var arrayOfFunctions = [];

for (var i = 0; i < 12; i++) {
  
  var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  var filePath = 'job' + months[i] + '14.xls';

  var seriesFunction = csvToExcel(filePath);
  arrayOfFunctions.push(seriesFunction);

}

client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
async.series(arrayOfFunctions, function(err) {
  console.log('all done!');
});


function csvToExcel (filePath) {
  return function(callback) {
    var workbook = XLS.readFile(filePath);
    var sheet_name_list = workbook.SheetNames;
    var Sheet1 = workbook.Sheets[sheet_name_list[0]];
    
    //go over every object (cell)
    for (var key in Sheet1) {
        //if the field exists
        if (typeof Sheet1[key].w != 'undefined') {
          //remove the commas
          Sheet1[key].w = removeCommas(Sheet1[key].w);
        }
    }

    //change fileName to .csv
    var csvFileName = filePath.replace('.xls', '.csv');
    //convert to csv
    var toCsv = XLS.utils.sheet_to_csv(Sheet1);
    //escape all '
    var csvWithSlashes = escapeSingleApostrophe(toCsv);

    fs.writeFile(csvFileName, csvWithSlashes, function(err) {
      if (err) throw err;
      console.log('converted!');
      callback();
    });   
  }
}


function escapeSingleApostrophe( str ) {
    return (str + '').replace(/[\\']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function removeCommas ( str ) {
  return (str + '').replace(/[,]/g, '');
}


    // for (var key in Sheet1) {
    //     if (key.search(/^BS|^BT|^BU|^BV|^BX/g) !== -1) {
    //       Sheet1[key].w = escapeCommas(Sheet1[key].w);
    //     }
    // }
