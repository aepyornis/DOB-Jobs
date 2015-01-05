//create map
var map = L.map('map', {
}).setView([40.669126, -73.918670], 12);

//basemaps

var osmMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'open street map'
        });

var toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>,<a href="http://creativecommons.org/licenses/by/3.0"> CC BY 3.0</a> &mdash; Map data: OSM',
        }).addTo(map);

var styles = {  
  blank: {
        fillOpacity: 0,
        opacity: 0,
        fillColor: '#ff0000' 
        },
  polygon: {
        fillColor: '#ff0000',
        fillOpacity: 0.9
    }
}



//running
$( document).ready(function(){
  addControl();
  addCostSlider();
  addJobTypeMenu();
  addDateSlider();
  ajaxRequest(2000, 'type', 'todaysdate', function(data) {
    console.log(data);
  })
});

//ajax request
function ajaxRequest(cost, type, date, callback) {

    var requestURL = 'http://localhost:3000/request';
    var requestData = {};
    requestData.bounds = mapBounds();
    requestData.cost = cost;
    requestData['type'] = type;
    requestData.date = date;

    $.ajax({
        url: requestURL,
        error: function() {
             console.log('theres an error');
          },
        // dataType: 'json',
        data: {json: JSON.stringify(requestData)},
        // contentType :'application/json',
        //callback function 
        success: callback,
        type: 'POST'
    });
}

//layer control
//adds Control to map-> must happen in Ajax callback
function addControl() {
    var baseMaps = {
        "Open Street Map": osmMap,
        "Black and White": toner
    };
    var overLays = {
      
    };

    L.control.layers(baseMaps, overLays, {position: "topright"}).addTo(map);

}

//get latlngBounds
function mapBounds () {
  var bounds = {
    SW: {},
    NE: {},
    NW: {},
    SE: {}
  };
  var mapBounds = map.getBounds();
  bounds.SW.lat = mapBounds.getSouthWest().lat;
  bounds.SW.lng = mapBounds.getSouthWest().lng;
  bounds.NE.lat = mapBounds.getNorthEast().lat;
  bounds.NE.lng = mapBounds.getNorthEast().lng;
  bounds.NW.lat = mapBounds.getNorthWest().lat;
  bounds.NW.lng = mapBounds.getNorthWest().lng;
  bounds.SE.lat = mapBounds.getSouthEast().lat;
  bounds.SE.lng = mapBounds.getSouthEast().lng;

  return bounds;
}


//jQueryUI functions
  function addCostSlider() {
    $("#cost_slider").slider({
        min: 0,
        max: 1000000,
        range: "max",
       
    });
    
  }
  function addDateSlider(){
    $("#date_slider").slider({
        min: 0,
        max: 11,
        range: "max",

    })
  }

  function addJobTypeMenu(){
    $("#job_type").selectmenu();
  }

//exports for testing
// module.exports = {
//   ajaxRequest: ajaxRequest
// };