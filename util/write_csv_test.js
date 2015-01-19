var fs = require('fs');
var utils = require('./util');

utils.writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'writecsv_test', {'CB': '304'}, function(){
              console.log('done')
        })