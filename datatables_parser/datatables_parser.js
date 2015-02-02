var _ = require('underscore');

// input: data tables object
// out: parsed data tablesobject
function parse_datatables_object (dt_req) {
  var parsed_obj = {
    columns: null,
    orders: [],
    draw: dt_req.draw,
    start: dt_req.start,
    length: dt_req.length,
    search: parseSearchValue(dt_req['search[value]'])
  }

  parsed_obj.columns = getColumns(dt_req);

}


function getColumns(dt_req) {
  var columns = [];

  for(var i=0; true; i++) {
      var data = 'columns[' + i + '][data]';
      var name = 'columns[' + i + '][name]';
      var searchable = 'columns[' + i + '][searchable]';
      var orderable = 'columns[' + i + '][orderable]';
      var search_value = 'columns[' + i + '][search][value]';
      var search_regex = 'columns[' + i + '][search][regex]';
  
      if (dt_req[data]) {
        var column =  {
          data: dt_req[data],
          name: dt_req[name],
          searchable: dt_req[searchable],
          orderable: dt_req[orderable],
          search_value: dt_req[search_value],
          search_regex: dt_req[search_regex]
        };

        columns.push(column); 
      }
      else 
        return columns
  }

}


function getOrders(dt_req) {

    var counter = 0;
    var orders = [];
    get_me_some_orders();
    return orders;

    function get_me_some_orders() {
      var column_num_field = 'order[' + counter + '][column]';
      if(dt_req[column_num_field]) {
        var columnNum = dt_req[column_num_field];
        var dir = 'order[' + counter + '][dir]';
        var column_name = 'columns[' + columnNum + '][name]';
        var column_data = 'columns[' + columnNum + '][data]';

        var order = {
          columnNum: columnNum,
          columnName: dt_req[column_name],
          columnData: dt_req[column_data],
          dir: dt_req[dir]
        }
        orders.push(order);
        counter += 1;
        get_me_some_orders();
      }
    }

}



function splitOnBrackets(str) {

  return _.without(str.split(/[\[\]]/), '');

}

function parseSearchValue(str) {
    if (str === '') {
      return false;
    } else {
      return str; 
    }
}

module.exports = {

    splitOnBrackets: splitOnBrackets,
    getColumns: getColumns,
    getOrders: getOrders
}

// { draw: '1',
//   'columns[0][data]': 'house',
//   'columns[0][name]': '',
//   'columns[0][searchable]': 'true',
//   'columns[0][orderable]': 'true',
//   'columns[0][search][value]': '',
//   'columns[0][search][regex]': 'false',
//   ....
//   'order[0][column]': '0',
//   'order[0][dir]': 'asc',
//   start: '0',
//   length: '10',
//   'search[value]': '',
//   'search[regex]': 'false' 
// }



// {
//     columns: [ {column_object} ]
//     orders: [ {order_object} ]
//     draw:
//     start:
//     length:
//     search[value]: "search text" or false
//     search[regex]:
// }

// column object:

// {
//   data:
//   name:
//   searchable:
//   orderable:
//   search_value:
//   research_regex:
// }


    // _.keys() -> array of keys

    // splitOnBrackets(str) {

    // }










