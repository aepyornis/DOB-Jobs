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

  console.log('request in');
  // console.log(req.body);
  
  var response = {};
  response.draw = req.body.draw;
  response.recordsTotal = 106569; 
  
  var sql = sql_query_builder(req.body)[0];
  var countQuery = sql_query_builder(req.body)[1];
  console.log(sql);
  console.log(countQuery);

  var count_promise = do_query(countQuery);
  count_promise.then(function(result){
      response.recordsFiltered = result[0].c;
  })

  
  var sql_promise = do_query(sql);
  sql_promise.then(function(result){
    response.data = result;
  })
    
  q.all([count_promise, sql_promise])
    .then(function(){
      res.send(JSON.stringify(response));
    })
          
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
  //arrays to hold columns, conditions, and order by
  var columns = [];
  var wheres = [];
  var global_wheres = [];
  var orders = [];
  //return strings
  var sql;
  var count;
  //global search
  var global_search;
  if (dt['search[value]']) {
    global_search = dt['search[value]'];
  }  else {
    global_search = false;
  }

  //iterate over the request object
  _.each(dt_req, function(value, key, obj){
    //get column names and do global search
    if (/columns\[\d\]\[data\]/.test(key)) {
        //get current column number
        var column_num = /columns\[(\d)\]\[data\]/.exec(key)[1];
        //find out if the column is searchable
        var searchable_field = 'columns[' + column_num + '][searchable]';
        columns.push(value);
        //if there's a global search field and the column is searchable, then create a where clause
        if (global_search && obj[searchable_field] === 'true') {
          var global_sql = value + " LIKE '%" + global_search + "%'";
          global_wheres.push(global_sql);
        }
    //get wheres
    } else if (/columns\[\d\]\[search\]\[value\]/.test(key)){
        if (value){
          var column_num = /columns\[(\d)\]\[search\]\[value\]/.exec(key)[1];
          var field_name = 'columns[' + column_num + '][data]';
          var sql =  obj[field_name] + " = " + "'" + value + "'";
          wheres.push(sql);
        }
    //get orders
    } else if (/order\[\d\]\[column\]/.test(key)) {
        var field_name = 'columns[' + value + '][data]';
        var order_num = /order\[(\d)\]\[column\]/.exec(key)[1];
        var order_dir_key = 'order[' + order_num + '][dir]';
        var sql =  obj[field_name] + ' ' + obj[order_dir_key];
        orders.push(sql);
    } else if (key === 'start') {

    } else if (key === 'length') {

    } else if (key === 'search[value]') {

    } else {

    }

  })
  
  //start sql
  sql = "SELECT " + columns.join() + " FROM dob_jobs ";
  count = "SELECT COUNT (*) as c FROM dob_jobs ";
  //if no wheres exist, assemble_where will return nothing.
  sql += assemble_wheres(wheres, global_wheres, global_search);
  count += assemble_wheres(wheres, global_wheres, global_search);
  //orders
  if (!_.isEmpty(orders)) {
    sql += " ORDER BY " + orders.join();
  }
  //add LIMIT and OFFSET
  sql += " LIMIT " + dt_req.length;
  sql += " OFFSET " + dt_req.start;
  
  return [sql, count];

  //assemble WHERE part
  function assemble_wheres(wheres, global_wheres, global_search){
      //both are empty, do nothing
      if(_.isEmpty(wheres) && _.isEmpty(global_search) {
         return;
      }
      var where_statment = 'WHERE ';
      //add global search clauses
      if (global_search) {
        where_statment += _.reduce(global_wheres, function(memo, value, i, list){
          var text = memo + value + " ";
          if (i < (list.length - 1) ) {
            text += 'OR '
          }
          return text;
        })
      }
      //if wheres is not empty
      if (!_.isEmpty(wheres)) {
        //if global_serach exists a "AND" is needed
        if (global_search) {
          where_statment += 'AND '
        }

        where_statment += wheres.join();
        where_statment += " ";
      }
      return where_statment;
  }

}


//start listening 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port)
})


module.exports = {
  sql_query_builder: sql_query_builder
}

//graveyard
//POST request
// app.post('/request', function(req, res) {
//   console.log('requst in');
//   //extract requestData from request
//   var requestData = JSON.parse(req.body.json);
// })

//get request
// app.get('/query', function(req, res){
//   console.log('requst in');
//   var sql = "SELECT house, streetName, bbl, latestActionDate, buildingType, existStories, proposedStories, ownerName, ownerBusinessName, jobDescription FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'";
//   do_query(sql)
//     .then(function(result){
//       var stringified = JSON.stringify(result);
//       res.send(stringified);
//       // res.send('hi there')
//     })
//     .then(null, console.error);
// })

