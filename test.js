var should = require('should');
var map = require('./map');

describe('ajaxRequest', function(){

  it('sends request to server', function(done){
    
    map.ajaxRequest('latlng', 10000, 'type', 'date', function(data) {

      data.should.be.typeof('object');
      done();

    })
  })
})


