var fs = require('fs');
var mongojs = require('mongojs');
var util = require('./util');

util.writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'test3', {'CB': '304'}, function(){
  console.log('done');
});