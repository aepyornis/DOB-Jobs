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

//layergroup, which will cleared and re-populated with data for every request
var mylayerGroup = L.layerGroup().addTo(map);

//style object
var styles = {  
  blank: {
        fillOpacity: 0,
        opacity: 0,
        fillColor: '#ff0000' 
        },
  polygon: {
        fillColor: '#ff0000',
        fillOpacity: 0.9
    },
  circle: {
    radius: 7,
    fillColor: '#1f78b4',
    fillOpacity: 0.9,
    color: '#FFFFFF',
    weight: 2    

   }
}

//variable to hold slider & menu values
var sliderValues = {
  cost: null,
  jobType: null,
  date: null
}

//on start
$( document).ready(function(){
  addLayerControl();
  createControls();
  updateValues();
  changeLabel();
});

//updates the map
function updateMap() {  
  //remove old layer
  mylayerGroup.clearLayers();
  //get data for new layer
  ajaxRequest(sliderValues.cost, sliderValues.jobType, sliderValues.date, function(data) {
    //create new layer
    var newLayer = L.geoJson(data, {
      onEachFeature: popUp,
      pointToLayer: toCircles
    });
    //add to map
    mylayerGroup.addLayer(newLayer);    
  })
}

//ajax request
//input: slider variables + callback
//output: callback with feature collection
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

//adds basemap control to map
function addLayerControl() {
    var baseMaps = {
        "Open Street Map": osmMap,
        "Black and White": toner
    };
    var overLays = {};
    L.control.layers(baseMaps, overLays, {position: "topright"}).addTo(map);
}

//get latlngBounds
//used by ajaxRequest
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
function createControls() {
  addCostSlider();
  addDateSlider();
  addJobTypeMenu();
  addSubmitButton();
}
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
      //function to execute when button is clicked
      updateMap();
    })
  }

//updates HTML above sliders
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

//used by pointToLayer in L.geojson
//style of circle can be change in styles.circle
function toCircles(feature, latlng) {
  return new L.CircleMarker(latlng, styles.circle);
}

//bind popup to each marker
//used by onEachFeature in L.geojson
function popUp(feature, layer) {
  var html = '<div class="infoPopup">';
  html += '<p><strong>Address:</strong> ' + address(feature.properties.House, feature.properties.StreetName) + '</p>';
  html += '<p><strong>Job Type:</strong> ' + jobtype(feature.properties.JobType) + '</p>';
  
  html += '<p><strong>Latest Action Date</strong> ' + feature.properties.LatestActionDate.slice(0,10) + '</p>';

  html += '<p><strong>Owner:</strong> ' + feature.properties.OwnerName + '</p>';
  html += '<p><strong>Owner Business:</strong> ' + feature.properties.OwnerBis + '</p>';

  //display only if there is a change in number of stories
  if (feature.properties.ProposedStories > feature.properties.ExistingStories) {
    var existingStories = (feature.properties.ExistingStories) ? feature.properties.ExistingStories : '0';
    html += '<p><strong>Existing Stories: </strong>' + existingStories  + '</p>';
    html += '<p><strong>Proposed Stories: </strong>' + feature.properties.ProposedStories + '</p>';
  }
  //display only if there is a change in dwelling units
  if (feature.properties.ProposedDwellingUnits > feature.properties.ExistingDwellingUnits) {
    var existingUnits = (feature.properties.ExistingDwellingUnits) ? feature.properties.ExistingDwellingUnits : '0';
    html += '<p><strong>Existing Units: </strong>' + existingUnits + '</p>';
    html += '<p><strong>Proposed Units: </strong>' + feature.properties.ProposedDwellingUnits + '</p>';
  } 

  //links to ACRIS and BIS
  html += '<p>' + bisLink(feature.properties.bbl) + '</p>';
  html += '<p>' + acrisLink(feature.properties.bbl) + '</p>';
  
  html += '</div>';

  layer.bindPopup(html);
}

//popup functions
//used by popUP()
  function address (house, street) {
    return house + ' ' + street;
  }

  function jobtype (type) {
    switch (type) {
      case 'A1':
        return 'Major Alteration (A1)';
        break;
      case 'A2':
        return 'Minor Alteration (A2)';
        break;
      case 'A3':
        return 'Minor Alteration (A3)';
        break;
      case 'NB':
        return 'New Building';
        break;
      default:
        return type;
        break;
    }
  }

  function acrisLink(bbl) {
      var link = '<a target="_blank" href="http://a836-acris.nyc.gov/bblsearch/bblsearch.asp?borough=3&block='
          + bbl.slice(1, 6) + '&lot=' + bbl.slice(6, 10) + '">Click here for ACRIS information</a>';
      return link;    
  }

  function bisLink(bbl) {
          var link = '<a target="_blank" href="http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro=3&block='
          + bbl.slice(1, 6) + '&lot=' + bbl.slice(6, 10) + '&go3=+GO+&requestid=0">Click here for DOB information</a>';
      return link;    
  }

//exports for testing
// module.exports = {
//   ajaxRequest: ajaxRequest
// };

