// input: data tables object
// out: parsed data tablesobject
function parse_datatables_object (dt_req) {
  var parsed_obj = {
    columns: null,
    orders: null,
    draw: dt_req.draw,
    start: dt_req.start,
    length: dt_req.length,
    search: (dt_req['search[value]'] === '') ? false : dt_req['search[value]']
  }

  parsed_obj.columns = getColumns(dt_req);
  parsed_obj.orders = getOrders(dt_req);

  return parsed_obj;

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
          searchValue: dt_req[search_value],
          searchRegex: dt_req[search_regex]
        };

        columns.push(column); 
      }
      else 
        return columns
  }

}

function getOrders(dt_req) {
  var orders = [];
    for (var i=0; true; i++) {
      var column_num_field = 'order[' + i + '][column]';
      if(dt_req[column_num_field]) {
        var columnNum = dt_req[column_num_field];
        var dir = 'order[' + i + '][dir]';
        var column_name = 'columns[' + columnNum + '][name]';
        var column_data = 'columns[' + columnNum + '][data]';

        var order = {
          columnNum: columnNum,
          columnName: dt_req[column_name],
          columnData: dt_req[column_data],
          dir: dt_req[dir]
        }
        orders.push(order);
      } else {
        return orders
      }
    }
}

function parseSearchValue(str) {
    if (str === '') {
      return false;
    } else {
      return str; 
    }
}

module.exports = {

    getColumns: getColumns,
    getOrders: getOrders,
    parse: parse_datatables_object
}

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












