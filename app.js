var express = require('express');
var mongo = require('mongoskin');
var bodyParser = require('body-parser');

//imitate app
var app = express()
//database  connection
var db = mongo.db("mongodb://localhost:27017/test", {native_parser: true});

//exposes ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));

//required for ajax to work CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//GET requests
app.get('/', function (req, res) {
  console.log('someone\'s here');
  res.send('welcome to the dob-jobs map maddness!')
})

//PUT request
app.post('/request', function(req, res) {
  console.log('requst in');
  //extact requestData from request
  var requestData = JSON.parse(req.body.json);

  //variables for query
  var bounds = requestData.bounds;
  var jobType = requestData.jobType;

  //run Query
  mongoQuery(bounds, jobType, function(responce){
    res.send(responce);
  });


  // res.send('right back at ya');
})


//start listening
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


//functions

// input: bounds
// output: items
function mongoQuery (bounds, jobType, callback) {
  db.collection('jobs').find({
    loc: {
      $geoWithin: {
        $geometry: {'type': 'Polygon',
        coordinates: boundsToCoordArray(bounds) 
        }
      }
    },
    JobType: selectMenuFormatedForMongo(jobType)
  }).sort({LatestActionDate: -1, }).limit(20).toArray(function(err, items){
    if (err) throw err;
    var featureCollection = toFeatureCollection(items);
    console.log("feature Collection: " + featureCollection);
    callback(featureCollection);
  })
}


//input: bounds object
//output: array
function boundsToCoordArray (b) {
  var NW_arr = [b.NW.lng, b.NW.lat];
  var NE_arr = [b.NE.lng, b.NE.lat]; 
  var SE_arr = [b.SE.lng, b.SE.lat];
  var SW_arr = [b.SW.lng, b.SW.lat];
  var coordinates = [[NW_arr, NE_arr, SE_arr, SW_arr, NW_arr]];
  return coordinates;
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
function assembleFeature(polygon) {
    var feature = {};
    feature['type'] = "Feature";
    feature.properties = polygon;
    // feature.properties._id = polygon._id;
    feature.geometry = {};
    feature.geometry['type'] = polygon.loc['type'];
    feature.geometry.coordinates = polygon.loc.coordinates;

    return feature;
}

//decodes type from major selectMenu
//input: 'NB', 'A1', 'minor', 'other', 'all'
//ouput:[ {jobType: } ]
function selectMenuFormatedForMongo(input) {
  if (input === 'NB' || input === 'A1') {
    return input;
  } else if (input === 'minor') {
    return {$in: ['A2', 'A3']}
  } else if (input === 'other'){
    return {$not: {$in: ['A1', 'A2','A3', 'NB']}}
  } else {
    return {$exists: true}
  }
}


module.exports = {
  boundsToCoordArray: boundsToCoordArray
}