var express = require('express');
var bodyParser = require('body-parser');
var q = require('q');
var _ = require('underscore');
var s = require("underscore.string");
var squel = require('squel')
squel.useFlavour('postgres');
//provide squel.count
squel.count = require('./count_squel');
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
  console.log(sql_query);

  var count_promise = do_query(countQuery)
    .then(function(result){
      response.recordsFiltered = result[0].c;
  })

  var sql_promise = do_query(sql_query)
    .then(function(result){
      response.data = result;
  })
    
  q.all([count_promise, sql_promise])
    .then(function(){
      res.send(JSON.stringify(response));
    })
          
})

//start listening 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port)
})

function do_query(sql) {
  var def = q.defer();
  pg.connect(function(err, client, done){
    if (err) {
        def.reject(err);
        console.log(err);
    } else {
        client.query(sql, function(err, result){
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
  //arrays to hold query information
  var columns = [];
  var global_wheres = [];
  var local_wheres = [];
  var local_wheres_values = [];
  var order_columns = [];
  var order_dirs = [];
  //query variable
  var query;
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
          var global_where = value + " LIKE ?";
          global_wheres.push(global_where);
        }
    //get 'local' wheres
    } else if (/columns\[\d\]\[search\]\[value\]/.test(key)){
        if (value){
          var column_num = /columns\[(\d)\]\[search\]\[value\]/.exec(key)[1];
          var field_name = 'columns[' + column_num + '][data]';
          //if using number range slider
          if(/-yadcf_delim-/.test(value)) {

            var low_value = /(\d*)-yadcf_delim-(\d*)/.exec(value)[1]
            var high_value = /(\d*)-yadcf_delim-(\d*)/.exec(value)[2];

            if (s.isBlank(low_value) && s.isBlank(high_value)) {
              //if both blank, do nothing
            } else if (s.isBlank(low_value) && high_value) {
              //no low_value, yes high_value
              var local_where = obj[field_name] + " <= ?";
              local_wheres.push(local_where);
              local_wheres_values.push(s.toNumber(high_value));
            } else if (low_value && s.isBlank(high_value)) {
              // yes low_value, no high_value.
              var local_where = obj[field_name] + " >= ?";
              local_wheres.push(local_where);
              local_wheres_values.push(s.toNumber(low_value));
            } else if (low_value && high_value) {
              //both low and high
              var low =  obj[field_name] + " >= ?";
              local_wheres.push(low);
              local_wheres_values.push(s.toNumber(low_value));
              var high = obj[field_name] + " <= ?";
              local_wheres.push(high);
              local_wheres_values.push(s.toNumber(high_value));
            } else {
              console.error("issues with number-range-input: " + key);
            }

          } else {
              //push columsn to local search columsn
               var local_where = obj[field_name] + " LIKE ?";
              local_wheres.push(local_where);
              //push value to arrays
              var with_wildcards = "%" + value + "%"
              local_wheres_values.push(with_wildcards);
          }
        }
    //get orders
    } else if (/order\[\d\]\[column\]/.test(key)) {
        var field_name = 'columns[' + value + '][data]';
        var order_num = /order\[(\d)\]\[column\]/.exec(key)[1];
        var order_dir_key = 'order[' + order_num + '][dir]';
        var order_column = obj[field_name];
        order_columns.push(order_column);

        if (obj[order_dir_key] === 'asc') {
          order_dirs.push(true);
        } else if (obj[order_dir_key] === 'desc') {
           order_dirs.push(false);
        } else {
          console.error('request order is not asc or desc');
        }
       
    } else {

    }

  })
  //generate query
  // the if/else is the order hack...until there's a better way...
  if (_.isEmpty(order_columns)) {
    query = squel.select()
      .fields(columns)
      .from("dob_jobs")
      .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
      .limit(dt_req.length)
      .offset(dt_req.start)
      .toParam(); 
  } else if (order_columns.length === 1) {
    query = squel.select()
      .fields(columns)
      .from("dob_jobs")
      .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
      .order(order_columns[0], order_dirs[0])
      .limit(dt_req.length)
      .offset(dt_req.start)
      .toParam(); 
  } else if (order_columns.length === 2) {
    query = squel.select()
      .fields(columns) 
      .from("dob_jobs")
      .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
      .order(order_columns[0], order_dirs[0])
      .order(order_columns[1], order_dirs[1])
      .limit(dt_req.length)
      .offset(dt_req.start)
      .toParam(); 
  } else if (order_columns.length > 2) {
    query = squel.select()
      .fields(columns)
      .from("dob_jobs")
      .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
      .order(order_columns[0], order_dirs[0])
      .order(order_columns[1], order_dirs[1])
      .order(order_columns[2], order_dirs[2])
      .limit(dt_req.length)
      .offset(dt_req.start)
      .toParam(); 
  } else {
    query = squel.select()
      .fields(columns)
      .from("dob_jobs")
      .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
      .limit(dt_req.length)
      .offset(dt_req.start)
      .toParam(); 
  }

  //create count
  var count = squel.count()
    .from('dob_jobs')
    .where( where_exp(global_search, global_wheres, local_wheres, local_wheres_values) )
    .toString();

  return [query, count];
}

//input: global search (str or false), [], [], []
//output squel.expr() or blank str
function where_exp(global_search, global_wheres, local_wheres, local_wheres_values) {
  var x = squel.expr();

  if (global_search){
      _.each(global_wheres, function(element) {
        var with_wildcards = "%" + global_search + "%";
        x.or(element, with_wildcards);
      })
  }
  
  if (!_.isEmpty(local_wheres)) {
    _.each(local_wheres, function(element, i) {
        x.and(element, local_wheres_values[i])
    })

  }

  if(global_search || !_.isEmpty(local_wheres)) {
    return x;
  } else {
    return "";
  }

}
