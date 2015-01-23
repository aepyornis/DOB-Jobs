var fs = require('fs');
var mongojs = require('mongojs');
// var _ = require('underscore');

// writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'test2', {'CB': '304'}, function(){console.log('done');});




function writeCSV(columnNames, fileName, query, callback){
  var db = mongojs('mongodb://localhost:27017/test', ['jobs']);
  //array of columnNames
  var columns = [];
  //ensure that columnNames is array
  if (typeof columnNames === 'string') {
    columns.push(columnNames);
  } else if (columnNames.constructor === Array) {
    columns = columnNames;
  } else {
    console.log('columnNames is not a string or an array');
    throw err;
  }
  //ensure query is object
  if (typeof query !== 'object') {
    query = {};
  }
  //create write stream
  var file = fs.createWriteStream(fileName + '.csv');
  //write headers
  file.write(columns.join());
  file.write('\n')
  db.jobs.find(query).forEach(function(err, doc){
    if (!doc) {
      file.end()
      //close database
      db.close();
      //optional callback()
      typeof callback === 'function' && callback();
    } else {
          columns.forEach(function(columnName, index, arr){
            if (doc[columnName]) {
              var field = '' + doc[columnName];
              file.write(field);
            } else {
              file.write(' ');
            }
            
            //prevents trailing comma
            if(index !== (arr.length - 1)) {
              file.write(',');
            }
          })
          //start new line
          file.write('\n');
    }
  })
}

module.exports = {
  writeCSV: writeCSV
}
