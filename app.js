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

var dtParser = require('./dtParser');
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
          var prepare = psql_to_dt(result.rows);
          def.resolve(prepare);
          done();
        })
      }
  })
  return def.promise;
}

//input: datatables request object
//output: [sql-query, count-query]
function sql_query_builder(dt_req) {
  //these are returned
  var rows_query;
  var count_query;
  //create squel select obj.
  var query = squel.select()
  //parse datatables request
  var dt = dtParser.parse(dt_req);
  //get fields
  _.each(dt.columns, function(col){
    query.field(col.data);
  })
  // TABLE AND WHERES
  query.from("dob_jobs")
    .where( where_exp(dt) );
  // order if they exist
  if (!_.isEmpty(dt.orders)) {
    _.each(dt.orders, function(order){
      query.order(order['columnData'], order['dir'])
    })
  }
  // limit and offset
  query.limit(dt.length).offset(dt.start);

  rows_query = query.toParam();

  count_query = squel.count()
    .from('dob_jobs')
    .where( where_exp(dt) )
    .toParam();

    return [rows_query, count_query];
}


//input: global search (str or false), [], [], []
//output squel.expr() or blank str
function where_exp(dt) {
  var x = squel.expr();

  var searchable_columns = _.chain(dt['columns']).filter(function(column) {
    if (column.searchable === 'true') {
      return true;
    }
  }).pluck('data').value();

  // do global search on searchable columns
  if (dt.search){
      _.each(searchable_columns, function(col) {
        global_search(col)}
      );
  }
  
    // do local searches. 
    _.each(dt.columns, function(c,i) {
      local_search(c, i)}
    );

  return x;

  // where_exp helper functions
  function local_search(column, i) {

    var search = column['searchValue'];
    // if blank
    if(s.isBlank(search)) {
      return;
    // if number  
    } else if (/^\d+$/.test(search)){
      var sql = column['data'] + " = ?"
      // coverts to INT. can be changed with work with decimals. 
      var value = s.toNumber(column['searchValue']);
      x.and(sql, value);
    // if date
    } else if (/\d{2}\/\d{2}\/\d{4}/.test(search)) {
      var date = /(\d{2})\/(\d{2})\/(\d{4})/.exec(search);
      console.log(date); 
      var date_str = date[3] + "/" + date[1] + "/" + date[2];
      var sql = column['data'] + " = ?"
      x.and(sql, date_str);
    } else {
      var sql = column['data'] + " LIKE ?"
      var value = "%" + column['searchValue'].toUpperCase() + "%";
      x.and(sql, value);
    }

  }

  function global_search(column) {
      var sql = column + " LIKE ?";
      var value = "%" + dt.search.toUpperCase() + "%";
      x.or(sql, value);
  }



}

// input: rows from psql query
// output: modified rows
// [ {}, {} ]
// 
function psql_to_dt(rows){

  var changed = _.map(rows, function(row){
      return change_row(row);
  })

  
  function change_row(row) {
    var newRow = row;
   var date = '' + row['latestactiondate'];
   newRow['latestactiondate'] = date.slice(0,15);
   
    return newRow;

  }


  return changed;

}







module.exports = {

  where_exp: where_exp,
  sql_query_builder: sql_query_builder

}