/*var should = require('should');

var parser = require('../dtParser');


describe('parse_datatables_object', function(){

  it('should work on sample request', function() {

    var sample = { draw: '1',
        'columns[0][data]': 'house',
        'columns[0][name]': '',
        'columns[0][searchable]': 'true',
        'columns[0][orderable]': 'true',
        'columns[0][search][value]': '',
        'columns[0][search][regex]': 'false',
        'columns[1][data]': 'streetname',
        'columns[1][name]': '',
        'columns[1][searchable]': 'true',
        'columns[1][orderable]': 'true',
        'columns[1][search][value]': '',
        'columns[1][search][regex]': 'false',
        'columns[2][data]': 'bbl',
        'columns[2][name]': '',
        'columns[2][searchable]': 'true',
        'columns[2][orderable]': 'true',
        'columns[2][search][value]': '',
        'columns[2][search][regex]': 'false',
        'order[0][column]': '0',
        'order[0][dir]': 'asc',
        start: '0',
        length: '10',
        'search[value]': '',
        'search[regex]': 'false' 
      }

      var test = parser.parse_datatables_object(sample);
      test['draw'].should.eql('1');
      test['columns'].should.be.an.array;
      test['columns'].should.have.lengthOf(3);
      test['columns'][1]['data'].should.eql('streetname');
      test['orders'].should.have.lengthOf(1);
      test['search'].should.be.false;

      console.log(test);


  })

})



describe('getColumns', function(){

    it('works with sample obj', function(){

        var sample_object = {
            draw: '1',
          'columns[0][data]': 'house',
          'columns[0][name]': '',
          'columns[0][searchable]': 'true',
          'columns[0][orderable]': 'true',
          'columns[0][search][value]': '',
          'columns[0][search][regex]': 'false',
          'columns[1][data]': 'streetname',
          'columns[1][name]': '',
          'columns[1][searchable]': 'true',
          'columns[1][orderable]': 'true',
          'columns[1][search][value]': '',
          'columns[1][search][regex]': 'false',
          'columns[2][data]': 'bbl',
          'columns[2][name]': '',
          'columns[2][searchable]': 'true',
          'columns[2][orderable]': 'true',
          'columns[2][search][value]': '',
          'columns[2][search][regex]': 'false'
        };


        var columns = parser.getColumns(sample_object);
        columns.should.have.lengthOf(3);
        columns[1]['data'].should.eql('streetname');


    })

})


describe('getOrders', function(){

    it('should work on sample', function(){
        var sample_object = {
                draw: '1',
              'columns[0][data]': 'house',
              'columns[0][name]': '',
              'columns[0][searchable]': 'true',
              'columns[0][orderable]': 'true',
              'columns[0][search][value]': '',
              'columns[0][search][regex]': 'false',
              'columns[1][data]': 'streetname',
              'columns[1][name]': '',
              'columns[1][searchable]': 'true',
              'columns[1][orderable]': 'true',
              'columns[1][search][value]': '',
              'columns[1][search][regex]': 'false',
              'columns[2][data]': 'bbl',
              'columns[2][name]': '',
              'columns[2][searchable]': 'true',
              'columns[2][orderable]': 'true',
              'columns[2][search][value]': '',
              'columns[2][search][regex]': 'false',
              'order[0][column]': '0',
              'order[0][dir]': 'asc'
         };

         var orders = parser.getOrders(sample_object);
         orders.should.have.lengthOf(1);
         orders[0]['dir'].should.eql('asc');
         orders[0]['columnData'].should.eql('house')

    })

 node node_modules/istanbul cover _mocha -- -R spec

})

*/
