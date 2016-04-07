'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var q = require('q');
var _ = require('underscore');
var s = require("underscore.string");
var through = require('through');
var QueryStream = require('pg-query-stream');
var squel = require('squel');
squel.useFlavour('postgres');
//provide squel.count
squel.count = require('./count_squel');
// my SELECT
squel.mySelect = require('./selectNull');
var config = require('./config');
var pg = require('pg');
// db settings
pg.defaults.database = config.database;
pg.defaults.host = config.host;
pg.defaults.user =  config.user;
pg.defaults.password = config.password;

//initiate app
var app = express();

//exposes ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));

// serve index.html from public folder
app.use(express.static('../public'));
// allow index.html to use js & css folders
app.use("/js", express.static('../js'));
app.use("/css", express.static('../css'));

// datatables draw
app.get('/datatables', function(req, res){
  //create response object
  var response = {};

  response.draw = req.query.draw;
  // total number of records in database.
  response.recordsTotal = getTotalRecords();
  
  //create SQL query and count query
  var sql_query = sql_query_builder(req.query)[0];
  var countQuery = sql_query_builder(req.query)[1];
 
  var count_promise = do_query(countQuery)
    .then(function(result){
      response.recordsFiltered = result[0].c;
  });

  var sql_promise = do_query(sql_query)
    .then(function(result){
      response.data = result;
  });
    
  q.all([count_promise, sql_promise])
    .then(function(){
      res.send(JSON.stringify(response));
    });
          
});

app.get('/csv', downloadCSV);

var server_port = config.port;
var server_ip_address = config.ip;
//start listening 
var server = app.listen(server_port, server_ip_address, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at http://%s:%s', host, port);
});

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
          // when there is a sql syntax error
          else if (typeof result.rows === 'undefined') {
            def.reject(result);
            console.log('SYNTAX ERROR? No rows');
          } else {
            var prepare = psql_to_dt(result.rows);
            def.resolve(prepare);
            done();
          }
        });
      }
  });
  return def.promise;
}

// input: str, object
function fromFields(field, query) {
  if (field === 'address') {
    query.field("house || ' ' || streetname || ', ' || zip as address");
  } else if (field === 'ownername') {
    query.field("ownersfirstname || ' ' || ownerslastname as ownername");
  } else if (field === 'applicantname') {
    query.field("applicantsfirstname || ' ' || applicantsfirstname as applicantname");
  } else {
    query.field(field);
  }
}


//input: datatables request object, optional: false as second arg to disable limit/offset
//output: [sql-query, count-query]
function sql_query_builder(dt, limit) {
 //  console.log(dt);
  //these are returned
  var rows_query;
  var count_query;
  //create squel select obj.
  var query = squel.mySelect();
  //parse datatables request

  var tableName = config.tableName;

  //get fields
  _.each(dt.columns, function(col){
    fromFields(col.data, query);
  });
  // TABLE AND WHERES
  query.from(tableName)
    .where( where_exp(dt) );
  // lat/lng contraints 
  if (dt.mapVisible === 'true' && dt.bounds) {
    query.where( boundsWhere(dt) );
  }
  
  // order if they exist
  if (!_.isEmpty(dt.order)) {
    _.each(dt.order, function(order){
      var direction = (order.dir === "desc") ? false : true;
      query.order(dt.columns[order.column].data, direction);
      if (order.dir === true && order.columnData === 'Approved') {
        query.nullOrder('FIRST');
      } else {
        query.nullOrder('LAST');
      }
    });
  }
  // limit and offset
  // pass false as second argument to prevent limit
  if (typeof limit === 'undefined') {
    query.limit(dt.length).offset(dt.start);
  } else if (limit === false) {
    // don't limit the function! 
  } else {
    query.limit(dt.length).offset(dt.start);
  }

  rows_query = query.toParam();

  count_query = squel.count()
    .from(tableName)
    .where( where_exp(dt) );

  if (dt.mapVisible === 'true' && dt.bounds) {
    count_query.where( boundsWhere(dt) );
  }
  count_query = count_query.toParam();

    return [rows_query, count_query];
}

//input: global search (str or false), [], [], []
//output squel.expr() 
function where_exp(dt) {
  var x = squel.expr();

  var searchable_columns = _.chain(dt.columns).filter(function(column) {
    if (column.searchable === 'true') {
      return true;
    }
  }).pluck('data').value();
  
  // do global search on searchable columns
  if (dt.search.value){
        _.each(searchable_columns, function(col) {
         global_search(x, dt,col);
      }
    );
  }

  // do local searches. 
    _.each(dt.columns, function(c,i) {
      local_search(x, c, i);
  });

  return x;
  
}

/*
 * where_exp helper functions
 */

// where_exp helper functions
// this creates the sql search for individual columns
function local_search(expr, column, i) {
    const search = column.search.value;

    if(s.isBlank(search)) {
      return;
    } else if (/^\d+$/.test(search)){ // if number
      let sql = column.data + " = ?";
      let value = s.toNumber(search); // coverts to INT. Change to with work with decimals. 
      expr.and(sql, value);
    // if date 
    } else if (/\d{2}\/\d{2}\/\d{4}/.test(search)) {
      let date = /(\d{2})\/(\d{2})\/(\d{4})/.exec(search);
      let date_str = date[3] + "/" + date[1] + "/" + date[2];
      let sql = column.data + " = ?";
      expr.and(sql, date_str);
    } else {
      let sql = column.data + " LIKE ?";
      let value = "%" + search.toUpperCase() + "%";
      expr.and(sql, value);
    }
}

function global_search(x,dt,columnData) {

  var sql = columnData + " LIKE ?";
  var value = "%" + dt.search.value.toUpperCase() + "%";
  x.or(sql, value);
}

function numberRangeSQL(x, search, column) {
  var low_value = /(\d*)-yadcf_delim-(\d*)/.exec(search)[1];
  var high_value = /(\d*)-yadcf_delim-(\d*)/.exec(search)[2];

  if (s.isBlank(low_value) && s.isBlank(high_value)) {
    //if both blank, do nothing
  } else if (s.isBlank(low_value) && high_value) {
    //no low_value, yes high_value
    
    var sql = column['data'] + " <= ?";
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
    var highSQL = column['data'] + " <= ?";
    x.and(highSQL, high_value);

  } else {
    console.error("issues with number-range-input");
  }
}

function month_match(search) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

function boundsWhere(dt) {
  var bounds = dt.bounds.split(',');
  return "( (lng_coord BETWEEN " +  bounds[0] + "  AND " + bounds[2] + ") AND (lat_coord BETWEEN " + bounds[1] + " AND " + bounds[3] + ") )"; 
}



// input: rows from psql query
// output: modified rows
// [ {}, {} ]
function psql_to_dt(rows){
  return _.map(rows, function(row){
      return change_row(row);
  });
}
 
function change_row (row) {
  return _.mapObject(row, function(val, key){
    if (val) {
      if (key === 'latestactiondate' || key === 'approved') {
         if (_.isDate(val)) {
           return '' + (val.getUTCMonth() + 1) + "-" + val.getUTCDate() + "-" + val.getUTCFullYear().toString();
         } else {
          return val.slice(4,15); 
         }
      } else if (key === 'jobdescriptiong') {
        return sentence_capitalize(val);
      // TODO: Fix key? Does owner Name still exist?
      } else if (key === 'ownername' || key === 'applicantname') {
        return s.titleize(val.toLowerCase());
      // TODO: No longer necessary?
      } 
      // else if (/existingnoofstories|proposednoofstories|existingdwellingunits|proposeddwellingunits/.test(key)) {
      //  return val.replace('.0', '');
      // } 
      else {
        return val;
      }
    } else {
      return val;
    }
  });
}

function sentence_capitalize(str) {
  var lowercase = str.toLowerCase();
  var capitalized_arr = _.map(lowercase.split('. '), function(val) {
    return s.capitalize(val);
  });
  return capitalized_arr.join('. ');
}

// returns total records, as of now, this has to be manually updated every month.
// TODO: find a better solution for this! 
function getTotalRecords(){
  return '213771';
}

function downloadCSV (req, res) {
  // set headers for attachment
  res.set("Content-Disposition", "attachment; filename=\"dobjobs.csv\"");
  res.set('Content-Type', 'text/plain');

  var columnNames = _.map(req.query.columns, function(col){
      return col.data;
  });
  // write columnNames
  res.write(columnNames.join(',') + '\n');
  // generate SQL
  var sql = sql_query_builder(req.query, false)[0];
  // Streaming query from postgres -> responce
  pg.connect(function(err, client, done) {
    if(err) throw err;
    var query = new QueryStream(sql.text, sql.values);
    var stream = client.query(query);
    //release the client when the stream is finished
    stream.on('end', done);
    // pipe data to response
    stream.pipe(through(write_one_row), function(){
      // this.queue(null);
      res.end();
    }).pipe(res);
  });
    // transform stream from objects to csv
    function write_one_row(row) {
       var arr = _.map(columnNames, function(name){
          if (!row[name]) {
              return '';
          } else {
              return row[name];
          }
       });
      var csv = arr.join(',') + '\n';
      this.queue(csv);
    }
}

// input address (str)
// output: {}. address.houseNum / address.street / address.borough / address.zip
// still a work in progress (!)
function address_to_bbl(address) {
    var def = q.defer();
    var split = address.split(';');
    var house_street = /(\d+\S*)[ ]+(\w+[ ]?\w*)/.exec(split[0]);
    var house = house_street[1];
    var street = house_street[2];
    var bor = format_bor(split[1]);
  
    var url = 'https://api.cityofnewyork.us/geoclient/v1/address.json?';
    url += 'houseNumber=' + encodeURIComponent(house) + '&street=' + encodeURIComponent(street) + '&borough=' + bor;
    url += '&app_id=a24f63ab&app_key=47bd8f72f07c547b4cfc72e7f0a6ad67';

    request(url, function(err, responce, body) {
      if(err) {
        def.reject(err);
      } else {
        var address = JSON.parse(body);
        def.resolve(address.address.bbl);
      }
    });

    return def.promise;

    function format_bor(b){
      switch(b) {
        case "MN":
          return "Manhattan";
        case "BX":
          return "Bronx";
        case "BK":
          return "Brooklyn";
        case "QN":
          return "Queens";
        case "SI":
          return "Staten Island";
        default:
          return;
      }
    }

 }


module.exports = {
  do_query: do_query,
  fromFields: fromFields,
  where_exp: where_exp,
  local_search: local_search
};
