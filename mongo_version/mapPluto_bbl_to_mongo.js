var fs = require('fs');
var mongo = require('mongoskin');
var JSONStream = require('JSONStream');

//open database connection
var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});

//creates a read-stream and an object-stream
var readStream = fs.createReadStream('data/nyc_bbl_centroid.geojson');
var objectStream = readStream.pipe(JSONStream.parse('features.*'));

//outputs features
objectStream.on('data', function(oneFeature){
    
    var feature = polygonConstructor(oneFeature);
    db.collection('nyc').insert(feature, function(err, result) {
        if (err) { console.log(err); };
    });         

})

objectStream.on('end', function (){
    console.log('stream ended');
    db.close();
})

function polygonConstructor(oneFeature) {
    var polygon = {};
    polygon.properties = {};
    polygon.loc = {};
    polygon.loc['type'] = oneFeature.geometry['type'];
    polygon.loc.coordinates = oneFeature.geometry.coordinates;
    polygon.properties.BBL = oneFeature.properties.BBL;

    return polygon;
}