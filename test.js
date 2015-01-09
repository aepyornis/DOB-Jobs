var should = require('should');
// var map = require('./map');
var app = require('./app');

describe('ajaxRequest', function(){

  it('sends request to server', function(done){
    
    map.ajaxRequest(10000, 'type', 'date', function(data) {

      data.should.be.typeof('object');
      done();

    })
  })
})


describe("boundsToCoordArray", function(){

  var bounds = { SW: { lat: 40.59101388345591, lng: -74.02999877929686 },
  NE: { lat: 40.74725696280421, lng: -73.80752563476562 },
  NW: { lat: 40.74725696280421, lng: -74.02999877929686 },
  SE: { lat: 40.59101388345591, lng: -73.80752563476562 } }

  it('correctly decodes bounds', function(){

    app.boundsToCoordArray(bounds).should.eql([[]]);
    console.log(boundsToCoordArray(bounds));

  })

})


