var fs = require('fs');
var should = require('should');
var utils = require('./util2');
// var db = mongojs('mongodb://localhost:27017/test', ['jobs']);

describe('writeCSV', function(){
  this.timeout(2);

    before(function(done){
      utils.writeCSV(['BuildingType', 'ExistingStories', 'OwnerName'], 'testme', {'CB': '304'}, function(){
              done()
        })
    })

    it('works on three variables', function(){
            var test_csv = fs.readFileSync('testme.csv').toString();
            var lines = test_csv.split(/\n/);
            lines[0].should.eql('BuildingType,ExistingStories,OwnerName');
            var lineLength = lines[1].split(',').length;
            lineLength.should.eql(3);
    })
          
})


