//get geoJSON from query
var fs = require('fs');
var mongo = require('mongoskin');
// var _ = require('underscore');
var db = mongo.db('mongodb://localhost:27017/test', {native_parser:true});


//set collection name
var collectionName = 'jobs';

//writeCSV
//cb = community board
//vars = variables, string or ['']
//fileName = 'fileName'

function writeCSV(vars, fileName, communityBoard, callback) {
    //array of vars
    var varArray = []; 
    //query object, fieldPicker
    var query = {};
    var fieldPicker = {};
    //check that vars in array 
    if (typeof vars === 'string') {
      varArray.push(vars);
    } else if (vars.constructor === Array) {
      varArray = vars;
    } else {
      console.log('vars is not a string or an array');
      throw err;
    }
    //check for CB
    if (communityBoard) {
      query.CB = communityBoard.toString();
    }

    varArray.forEach(function(v,i,a){
      fieldPicker[v] = 1;
    })

		db.collection(collectionName).find(query, fieldPicker).toArray(function (err, result){
				if (err) throw err;
				//result is array of objects 
				console.log('number of rows returned: ' + result.length);
				//vars to hold csv
        var csv = '';
        //create write stream
        var file = fs.createWriteStream(fileName + '.csv');
        //write headers
        file.write(varArray.join());
        //loop over each document returned from mongo
        result.forEach(function(doc){
            //write each field separated by a comma
            varArray.forEach(function(field,index,array){
              var fieldValue = doc[field];
              file.write(fieldValue);
              if (index !== array.length) {
               file.write(',');
              }  
            })
            //new line
            file.write('\n');   
        });
        //end stream
        file.end();
        //callback
        typeof callback === 'function' && callback();
		})

}


function writeGeoJson(CB, job_type, fileName){
		db.collection(collectionName).find({CB: CB, JobType:  job_type}).toArray(function (err, items) {
			if (err) {
				console.log(err); 
			} else {
				console.log('number of jobs: ' + items.length);
					//turns polygon into featureCollection 
				var featureCollection = toFeatureCollection(items);
				var stringCollection = JSON.stringify(featureCollection);
				fs.writeFile(fileName, stringCollection, function(err){
					if (err) throw err;
					db.close(); console.log('done writing file');
				});
			}
		})
}

//generates geoJSON Feature Collections
//input: array of polygons
//output: geoJSON object
function toFeatureCollection(arrayOfPolygons) {
		var featureCollection = {
				"type": "FeatureCollection",
				"features": []
		};
		for (var i = 0; i < arrayOfPolygons.length; i++) {
				featureCollection.features.push(assembleFeature(arrayOfPolygons[i]));
		};    
		return featureCollection;
}

//assembles one feature. used by toFeatureCollection
//watch out because it doesn't work well with nested properites
function assembleFeature(polygon) {
		var feature = {};
		feature['type'] = "Feature";
		feature.properties = polygon;
		feature.properties.address = polygon.House + ' ' + polygon.StreetName;
		feature.properties.jobdescript = polygon.JobDescript;
		feature.properties.ownerbusin = polygon.OwnerBis;
		feature.properties.ownerphone = polygon.OwnerPhone;
		feature.properties.existingst = polygon.ExistingStories;
		feature.properties.proposedst = polygon.ProposedStories;
		// feature.properties._id = polygon._id;
		feature.geometry = {};
		feature.geometry['type'] = polygon.loc['type'];
		feature.geometry.coordinates = polygon.loc.coordinates;

		return feature;
}

module.exports = {
  writeCSV: writeCSV
}
