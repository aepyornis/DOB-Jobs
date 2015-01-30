var express = require('express');
var bodyParser = require('body-parser');
var q = require('q');
var _ = require('underscore');
var pg = require('pg');
  pg.defaults.database = 'dob';
  pg.defaults.host = 'localhost';
  pg.defaults.user = 'mrbuttons';
  pg.defaults.password = 'mrbuttons';

//initiate app
var app = express()

//exposes ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));

// serve index.html from public folder
app.use(express.static(__dirname + '/public'));
// allow index.html to use js & css folders
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));


//post request
app.post('/datatables', function(req, res){

  //create response object
  var response = {};
  response.draw = req.body.draw;
  //total number of records in database. hard-coded for now.
  response.recordsTotal = 106569; 
  
  //create SQL query and count query
  var sql_query = sql_query_builder(req.body)[0];
  var countQuery = sql_query_builder(req.body)[1];
  var values = sql_query_builder(req.body)[2];
  console.log(sql_query);
  console.log(values);


  var count_promise = do_query(countQuery, values)
    .then(function(result){
      response.recordsFiltered = result[0].c;
  })

  var sql_promise = do_query(sql_query, values)
    .then(function(result){
      response.data = result;
  })
    
  q.all([count_promise, sql_promise])
    .then(function(){
      res.send(JSON.stringify(response));
    })
          
})

function do_query(sql, values) {
  var def = q.defer();
  pg.connect(function(err, client, done){
    if (err) {
        def.reject(err);
        console.log(err);
    } else {
        client.query(sql, values, function(err, result){
          if (err) {
            def.reject(err);
            console.log(err);
          }
          def.resolve(result.rows); 
          done();
        })
      }
  })
  return def.promise;
}

//input: datatables request object
//output: [sql-query, count-query]
function sql_query_builder(dt_req) {
  //arrays to hold columns, 'local' wheres, global search wheres, and order bys
  var columns = [];
  var global_search_columns = [];
  var local_search_columns = [];
  var local_search_values = [];
  var order_columns = [];
  var order_dirs = [];
  //return strings
  var sql;
  var count;
  //global search
  var global_search;
  if (dt_req['search[value]']) {
    global_search = dt_req['search[value]'];
  }  else {
    global_search = false;
  }

  //iterate over the request object
  _.each(dt_req, function(value, key, obj){
    //get column names and do global search
    if (/columns\[\d\]\[data\]/.test(key)) {
        //push column names into array for SELECT clause
        columns.push(value);
        //get current column number
        var column_num = /columns\[(\d)\]\[data\]/.exec(key)[1];
        //find out if the column is searchable
        var searchable_field = 'columns[' + column_num + '][searchable]';
        //if there's a global search field and the column is searchable, then create where clauses
        if (global_search && obj[searchable_field] === 'true') {
          global_search_columns.push(value);
        }
    //get 'local' wheres
    } else if (/columns\[\d\]\[search\]\[value\]/.test(key)){
        if (value){
          var column_num = /columns\[(\d)\]\[search\]\[value\]/.exec(key)[1];
          var field_name = 'columns[' + column_num + '][data]';
          //push columsn to local search columsn
          local_search_columns.push(obj[field_name]);
          //push values to arrays
          local_search_values.push(value);
        }
    //get orders
    } else if (/order\[\d\]\[column\]/.test(key)) {
        var field_name = 'columns[' + value + '][data]';
        var order_num = /order\[(\d)\]\[column\]/.exec(key)[1];
        var order_dir_key = 'order[' + order_num + '][dir]';
        
        order_columns.push(obj[field_name]);
        order_dirs.push(obj[order_dir_key])

    } else if (key === 'start') {

    } else if (key === 'length') {

    } else if (key === 'search[value]') {

    } else {

    }

  })
  
  //start sql
  sql = "SELECT " + columns.join() + " FROM dob_jobs ";
  count = "SELECT COUNT (*) as c FROM dob_jobs ";

  //this is a variable that will hold the number for the parameitzed SQL variable, i.e. $1, $2
  var counter = 1;

  if (global_search || !_.isEmpty(local_search_columns)) {
    sql += "WHERE ";
    count += "WHERE ";
  }

  if (global_search) {
    sql += "(";
    count += "("
    //incrase counter;
    counter += 1;
    var search_sql = _.reduce(global_search_columns, function(memo, value, i, list){
          var text = memo + value + " LIKE $1";
          if (i < (list.length - 1) ) {
            text += " OR "
          }
          return text;
    }, '')

    sql += search_sql + ")";
    count += search_sql +")";
  
  }

  if (!_.isEmpty(local_search_columns)){

      if (global_search) {
        sql += " AND (";
      }


      var local_search_sql = _.reduce(local_search_columns, function(memo, value, i, list) {
          var text = memo + value + " = " + "$" + counter;
          counter += 1;
          if (i < (list.length - 1)) {
            text += " AND "
          }
          return text;
      }, '')
  
      sql += local_search_sql;
      count += local_search_sql;

      if(global_search) {
        sql += ")";
        count += ")";
      }
  
   }

  if (!_.isEmpty(order_columns)) {
    sql += " ORDER BY ";
    sql += _.reduce(order_columns, function(memo, value, i, list){
      return memo + value + " " + order_dirs[i] + " ";
    }, '')
  }

  //add LIMIT and OFFSET
  sql += " LIMIT " + dt_req.length;
  sql += " OFFSET " + dt_req.start;

  //array of all values: global + local
  var values = [];
  if (global_search) {
    var prepared_for_LIKE = '%' + global_search + '%';
    values.push(prepared_for_LIKE);
  }
  if (!_.isEmpty(local_search_values)) {
    _.each(local_search_values, function(v){
      values.push(v);
    })
  }
  //return sql string array

  // var sql_object = {
  //   text: sql,
  //   values: values 
  // }

  // var count_object = {
  //   text: count,
  //   values: values
  // }
  return [sql, count, values];
}


//start listening 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port)
})


module.exports = {
  sql_query_builder: sql_query_builder
}

