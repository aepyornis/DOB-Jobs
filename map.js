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


//layergroup
var mylayerGroup = L.layerGroup().addTo(map);


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

//variable to hold control values
var sliderValues = {
  cost: null,
  jobType: null,
  date: null
}


//running
$( document).ready(function(){
  addControl();
  addCostSlider();
  addJobTypeMenu();
  addDateSlider();
  addSubmitButton();
  updateValues();
  changeLabel();

});

function updateMap() {
      
  //remove old layer
  mylayerGroup.clearLayers();

  //get data for new layer
  ajaxRequest(sliderValues.cost, sliderValues.jobType, sliderValues.date, function(data) {
    // console.log(data);

    //create new layer
    var newLayer = L.geoJson(data, {});
    //add to map
    mylayerGroup.addLayer(newLayer);    
  
  })

}

//ajax request
function ajaxRequest(cost, type, date, callback) {

    var requestURL = 'http://localhost:3000/request';
    var requestData = {};
    requestData.bounds = mapBounds();
    requestData.cost = cost;
    requestData.jobType = type;
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

//update values of controls
function updateValues () {

  sliderValues.cost = $( "#cost_slider" ).slider( "value" );
  sliderValues.jobType = $("#job_type").val();
  sliderValues.date = $("#date_slider").slider( "value" );

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
      max: 10000000,
      step: 1000,
      range: "max",
      create: function(e, ui) {
         var costHTML = '<p>Initial Cost from $0 to $10million</p>';
          $("#cost_label").html(costHTML)
      },
      change: updateValues
    })
  }

  function addDateSlider(){
    $("#date_slider").slider({
        min: 0,
        max: 11,
        range: "max",
        create: function(e, ui) {
            var dateHTML = '<p>From January 2014 to December 2014</p>';
            $('#date_label').html(dateHTML);
        },
        change: updateValues
    })
  }

  function addJobTypeMenu(){
    $("#job_type").selectmenu({
      change: updateValues
    });
  }

  function addSubmitButton(){
    $("#submitButton").button().click(function(){
      //function to excute when button is clicked
      updateMap();
    })
  }

//jQuery label functions 

function changeLabel () {

  $("#cost_slider").on("slide", function (event, ui){
    var costHTML = '<p>Initialcost from $' + ui.value + ' to $10million</p>';
    $("#cost_label").html(costHTML);
  })

  $('#date_slider').on("slide", function (event, ui) {

    var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dateHTML = '<p>From ' + months[ui.value] + ' 2014 to December 2014</p>';
    $('#date_label').html(dateHTML);
  })

}



  
//exports for testing
// module.exports = {
//   ajaxRequest: ajaxRequest
// };

