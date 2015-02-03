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
  //these are returned
  var rows_query;
  var count_query;

  //parse datatables request
  var dt = dtParser(dt_req);

  var fields = _.reduce(dt['columns'], function(memo, column_obj, i, list){
    return memo + column_obj['data'] + ",";
  }, '')

  var query = squel.select()
    .fields(fields)
    .from("dob_jobs")
    .where( where_exp() )

  if (!_.isEmpty(dt.orders)) {
    _.each(dt.orders, function(order){
      query.order(order['columnData'], order['dir'])
    })
  }

  query.limit(dt.length).offset(dt.start);

  rows_query = query.toParam();

  count _query = squel.count()
    .from('dob_jobs')
    .where( where_exp() )
    .toString();

    return [rows_query, count_query];
}


//input: global search (str or false), [], [], []
//output squel.expr() or blank str
function where_exp(dt) {
  var x = squel.expr();

  var searchable_columns = _.map(dt.columns, function(val, key, column){
    if (column['searchable'] === 'true') {
      return column['data'];
    } else {
      return;
    }
  })

  // do global search on searchable columns
  if (dt.search){
      _.each(searchable_columns, function(column) {
        var sql = column + " LIKE ?";
        var value = "%" + dt.search + "%";
        x.or(sql, value);
      })
  }
  
    // do local searches. 
    _.each(columns, function(column, i) {
      // if blank
      if(s.isBlank(column['searchValue'])) {
        return;
      // if number  
      } else if (/[\d*]/.test(column['searchValue'])){
        var sql = column['data'] + " = ?"
        // coverts to INT. can be changed with work with decimals. 
        var value = s.toNumber(column['searchValue']);
        x.and(sql, value);
      } else {
        var sql = column['data'] + " LIKE ?"
        var value = column['searchValue'];
        x.and(sql, value);
      }
    })

  }

  
}
