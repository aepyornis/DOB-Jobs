var XLS = require('xlsjs');
var fs = require('fs');

var workbook = XLS.readFile('job0114.xls');
var sheet_name_list = workbook.SheetNames;
var Sheet1 = workbook.Sheets[sheet_name_list[0]];

var writeStream = fs.createWriteStream('testXLS.csv');

var toCsv = XLS.utils.sheet_to_csv(Sheet1);

fs.writeFile('testXLS.csv', toCsv, function(err) {
  if (err) throw err;
  console.log('converted!');
});

