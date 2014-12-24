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

//running
$( document).ready(function(){
  addControl();
  addCostSlider();
  addJobTypeMenu();
  addDateSlider();
});

//slider

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