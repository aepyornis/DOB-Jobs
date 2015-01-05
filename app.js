var express = require('express');
var mongo = require('mongoskin');
var bodyParser = require('body-parser');

//imitate app
var app = express()
//database  connection
var db = mongo.db("mongodb://localhost:27017/test", {native_parser: true});

//exposes ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));

//required for ajax to work//CORS
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
  var requestData = JSON.parse(req.body.json);
  var bounds = requestData.bounds;
  console.log(bounds);
  boundsQuery(bounds);


  res.send('right back at ya');
})


//start listening
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})


//functions

function mongoQuery () {
  db.collection('jobs').find({}).limit(2).toArray(function(err, items){
    if (err) { console.log(err); }
  })
}

// input: bounds
// output: items
function boundsQuery (bounds) {
  db.collection('jobs').find({
    loc: {
      $geoWithin: {
        $geometry: {'type': 'Polygon',
        coordinates: boundsToCoordArray(bounds) 
        }
      }
    }
  }).limit(20).toArray(function(err, items){
    if (err) throw err;
    console.log(items);
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


module.exports = {
  boundsToCoordArray: boundsToCoordArray
}