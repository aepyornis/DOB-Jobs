//get geoJSON from query
var fs = require('fs');
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/test', {native_parser:true});


db.collection('jobs').find({CB: "304", JobType: "NB"  }).toArray(function (err, items) {
  if (err) {
    console.log(err); 
  } else {
    console.log('number of jobs: ' + items.length);
      //turns polygon into featureCollection 
    var featureCollection = toFeatureCollection(items);
    var stringCollection = JSON.stringify(featureCollection);
    fs.writeFile('bushwick_jobs_2014_nb.geojson', stringCollection, function(err){
      if (err) throw err;
      db.close(); console.log('done writing file');
    });
  }
})

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
