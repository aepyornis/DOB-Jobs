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

async.series(arrayOfFunctions, function(err) {
  console.log('all done!');
});


function csvToExcel (filePath) {
  return function(callback) {
    var workbook = XLS.readFile(filePath);
    var sheet_name_list = workbook.SheetNames;
    var Sheet1 = workbook.Sheets[sheet_name_list[0]];

    var csvFileName = filePath.replace('.xls', '.csv');
    // var writeStream = fs.createWriteStream(csvFileName);
    var toCsv = XLS.utils.sheet_to_csv(Sheet1);

    fs.writeFile(csvFileName, toCsv, function(err) {
      if (err) throw err;
      console.log('converted!');
      callback();
    });   
  }
}

