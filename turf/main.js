var fs = require('fs');
var turf = require('turf');

var nyc = JSON.parse(fs.readFileSync('nyc_all5.geojson'));

var bbox = [-74.33624, 40.449037, -73.6688232, 40.981971];
//create hex-grid for NYC area
var hex = turf.hexGrid(bbox, 0.5, "miles");

//extract polygons from feature collections:
var hexPolygons = [];
hex.features.forEach(function(feature){
  hexPolygons.push(turf.polygon(feature.geometry.coordinates));
});
// hexPolygons contains an array of features

// do the intersection:
var nycHexPolygons = [];
var counter = 0;

hexPolygons.forEach(function(hexPolygon){
  counter += 1;
  if (counter % 100 === 0) { console.log(counter + " completed out of " + hexPolygons.length)}
  nyc.features.forEach(function(borough){
    var intersectPolygon = turf.intersect(hexPolygon, borough);
    if (typeof intersectPolygon != 'undefined') {
      nycHexPolygons.push(intersectPolygon);
    }
   });
});
  
var intersectNYC = turf.featurecollection(nycHexPolygons);

writeFile('hexnyc.geojson', intersectNYC);

function writeFile (filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}
