var fs = require('fs');
var mongojs = require('mongojs');
// var _ = require('underscore');

// writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'test3', {'CB': '304'}, function());

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
  //create cursor
  var cursor = db.jobs.find(query);
  //listen for each document
  cursor.on('data', function(doc){
    //write fields for each document
    columns.forEach(function(columnName, index, arr){
      var field = '' + doc[columnName];
      file.write(field);
      //prevents trailing comma
      if(index !== (arr.length - 1)) {
        file.write(',');
      }
    })
    //start new line
    file.write('\n');
  })
  //functions to call when cursor is finished
  cursor.on('end', function(){
    //end write stream
    file.end()
    //close database
    db.close();
    //optional callback()
    typeof callback === 'function' && callback();
  })
}

// function writeGeoJson(CB, job_type, fileName){
// 		db.collection(collectionName).find({CB: CB, JobType:  job_type}).toArray(function (err, items) {
// 			if (err) {
// 				console.log(err); 
// 			} else {
// 				console.log('number of jobs: ' + items.length);
// 					//turns polygon into featureCollection 
// 				var featureCollection = toFeatureCollection(items);
// 				var stringCollection = JSON.stringify(featureCollection);
// 				fs.writeFile(fileName, stringCollection, function(err){
// 					if (err) throw err;
// 					db.close(); console.log('done writing file');
// 				});
// 			}
// 		})
// }

// //generates geoJSON Feature Collections
// //input: array of polygons
// //output: geoJSON object
// function toFeatureCollection(arrayOfPolygons) {
// 		var featureCollection = {
// 				"type": "FeatureCollection",
// 				"features": []
// 		};
// 		for (var i = 0; i < arrayOfPolygons.length; i++) {
// 				featureCollection.features.push(assembleFeature(arrayOfPolygons[i]));
// 		};    
// 		return featureCollection;
// }

// //assembles one feature. used by toFeatureCollection
// //watch out because it doesn't work well with nested properites
// function assembleFeature(polygon) {
// 		var feature = {};
// 		feature['type'] = "Feature";
// 		feature.properties = polygon;
// 		feature.properties.address = polygon.House + ' ' + polygon.StreetName;
// 		feature.properties.jobdescript = polygon.JobDescript;
// 		feature.properties.ownerbusin = polygon.OwnerBis;
// 		feature.properties.ownerphone = polygon.OwnerPhone;
// 		feature.properties.existingst = polygon.ExistingStories;
// 		feature.properties.proposedst = polygon.ProposedStories;
// 		// feature.properties._id = polygon._id;
// 		feature.geometry = {};
// 		feature.geometry['type'] = polygon.loc['type'];
// 		feature.geometry.coordinates = polygon.loc.coordinates;

// 		return feature;
// }

module.exports = {
  writeCSV: writeCSV
}
