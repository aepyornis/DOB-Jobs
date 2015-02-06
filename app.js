var express = require('express');
var bodyParser = require('body-parser');
var q = require('q');
var _ = require('underscore');
var s = require("underscore.string");
var squel = require('squel')
squel.useFlavour('postgres');
//provide squel.count
squel.count = require('./count_squel');
// my SELECT
squel.mySelect = require('./selectNull');
var pg = require('pg');
  pg.defaults.database = 'dob';
  pg.defaults.host = 'localhost';
  pg.defaults.user = 'mrbuttons';
  pg.defaults.password = 'mrbuttons';
  // open shift settings
  // pg.defaults.database = 'dobjobs';
  // pg.defaults.host = OPENSHIFT_POSTGRESQL_DB_HOST;
  // pg.defaults.user = OPENSHIFT_POSTGRESQL_DB_USERNAME;
  // pg.defaults.password = OPENSHIFT_POSTGRESQL_DB_PASSWORD;
  // pg.defaults.port = OPENSHIFT_POSTGRESQL_DB_PORT;

var dtParser = require('./dtParser');
// store table name for SQL query
var tableName = "dob_jobs_2014";
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
  var query = squel.mySelect()
  //parse datatables request
  var dt = dtParser.parse(dt_req);
  //get fields
  _.each(dt.columns, function(col){
    query.field(col.data);
  })
  // TABLE AND WHERES
  query.from(tableName)
    .where( where_exp(dt) );
  // order if they exist
  if (!_.isEmpty(dt.orders)) {
    _.each(dt.orders, function(order){
      query.order(order.columnData, order.dir)
      console.log(order)
      if (order.dir === true && order.columnData === 'approveddate') {
        query.nullOrder('FIRST');
      } else {
        query.nullOrder('LAST');
      }
      
    })
  }
  // limit and offset
  query.limit(dt.length).offset(dt.start);

  rows_query = query.toParam();

  count_query = squel.count()
    .from(tableName)
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
    // search = search value
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
      var date_str = date[3] + "/" + date[1] + "/" + date[2];
      var sql = column['data'] + " = ?"
      x.and(sql, date_str);
    } 
    // if number-range
    else if (/-yadcf_delim-/.test(search)){

      numberRangeSQL(search, column);

    }
    
    else {
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

  function numberRangeSQL(search, column) {

    var low_value = /(\d*)-yadcf_delim-(\d*)/.exec(search)[1]
    var high_value = /(\d*)-yadcf_delim-(\d*)/.exec(search)[2];

    if (s.isBlank(low_value) && s.isBlank(high_value)) {

        
      //if both blank, do nothing
    } else if (s.isBlank(low_value) && high_value) {
      //no low_value, yes high_value
    
      var sql = column['data'] + " <= ?"
      x.and(sql, high_value);
      var lowSQL = column['data'] + " >= ?";
      x.and(lowSQL, 0);

    } else if (low_value && s.isBlank(high_value)) {
      // yes low_value, no high_value.
      var sql = column['data'] + " >= ?";
      x.and(sql, low_value);

    } else if (low_value && high_value) {
      //both low and high
      var lowSQL = column['data'] + " >= ?";
      x.and(lowSQL, low_value);
      var highSQL = column['data'] + " <= ?"
      x.and(highSQL, high_value);

    } else {
      console.error("issues with number-range-input");
    }

  }

  function month_match(search) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if (_.find(months, function(val){
      if (search === val) {
        return true;
      }
    })) {
      return true; 
    } else {
      return false;
    }

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
    newRow['latestactiondate'] = date.slice(4,15);
    if (row.jobdescription){
        newRow.jobdescription = sentence_capitalize(row.jobdescription)
    }
    if (row.ownername) {
      newRow.ownername = s.titleize(row.ownername.toLowerCase());
    }
    if (row.approveddate) {
      var date = '' + row.approveddate;
      newRow.approveddate = date.slice(4, 15);
    }

    return newRow;

  }


  return changed;

}


function sentence_capitalize(str) {
  var lowercase = str.toLowerCase();
  var capitalized_arr = _.map(lowercase.split('. '), function(val) {
    return s.capitalize(val);
  })
  return capitalized_arr.join('. ');
}




module.exports = {

  where_exp: where_exp,
  sql_query_builder: sql_query_builder,
  sentence_capitalize:sentence_capitalize

}