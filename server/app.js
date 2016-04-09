'use strict';

const express = require('express');

const bodyParser = require('body-parser');
const q = require('q');
const _ = require('underscore');
const s = require("underscore.string");
const through = require('through');
const QueryStream = require('pg-query-stream');
const squel = require('squel');
// my SELECT
squel.mySelect = require('./selectNull');
const config = require('./config');
const pg = require('pg');
// db settings
pg.defaults.database = config.database;
pg.defaults.host = config.host;
pg.defaults.user =  config.user;
pg.defaults.password = config.password;

//initiate app
const app = express();

//exposes Ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));
// serve index.html from public folder
app.use(express.static(config.publicFolder));
// allow index.html to use js & css folders
app.use("/js", express.static(config.publicFolder + '/js'));
app.use("/css", express.static(config.publicFolder + '/css'));

// datatables draw
app.get('/datatables', (req, res)=> {
  //create response object
  const response = {};
  response.draw = req.query.draw;
  // total number of records in database.
  response.recordsTotal = getTotalRecords();
  //create SQL query and count query
  const [sql_query, countQuery] = sql_query_builder(req.query);
  
  const count_promise = do_query(countQuery)
          .then((result) => response.recordsFiltered = result[0].c);

  const sql_promise = do_query(sql_query)
          .then((rows) => response.data = psql_to_dt(rows));

  const sendJSON = () => res.json(response);
  const handleError = (err) => console.log('postgres error: ' + err);  
  
  q.all([count_promise, sql_promise]).then(sendJSON, handleError);

});

app.get('/csv', downloadCSV);
//start listening 
const server = app.listen(config.port, config.ip, ()=> {
  let {address, port} = server.address();
  console.log('app listening at http://%s:%s', address, port);
});

function do_query(sql) {
  var def = q.defer();
  pg.connect(function(err, client, done){
    if (err) {
        def.reject(err);
    } else {
        client.query(sql, function(err, result){
          if (err) {
            def.reject(err);
          } 
          else if (typeof result.rows === 'undefined') {
            def.reject(result);
          } else {
            def.resolve(result.rows);
            done();
          }
        });
      }
  });
  return def.promise;
}

// input: datatables request object, optional: false as second arg to disable limit/offset
// output: [sql-query, count-query]
function sql_query_builder(dt, limit) {
  limit = (_.isUndefined(limit)) ? true : limit;
  let rows_query;
  let count_query;
  const tableName = config.tableName;
  const query = squel.mySelect({numberedParameters: true}); //create squel select obj.
  
  _.each(dt.columns, (col) => fromFields(col.data, query)); // get fiends (SELECT)
  query.from(tableName); // FROM
  query.where( where_exp(dt) ); // WHERE
  
  // lat/lng constraints 
  if (dt.mapVisible === 'true' && dt.bounds) {
    query.where( boundsWhere(dt) );
  }
  
  // order if necessary
  if (!_.isEmpty(dt.order)) {
    _.each(dt.order, function(order){
      const direction = (order.dir === "desc") ? false : true;
      const approvedColumnAsc = (direction === true)
              && (dt.columns[order.column].data === 'approved');

      query.order(dt.columns[order.column].data, direction);
      (approvedColumnAsc) ? query.nullOrder('FIRST') : query.nullOrder('LAST');
    });
  }
  // limit and offset
  if (limit) {
    query.limit(dt.length).offset(dt.start);
  }  

  count_query = squel.select({numberedParameters: true})
    .field("COUNT(*) as c")
    .from(tableName)
    .where( where_exp(dt) );

  return [query.toParam(), count_query.toParam()];
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

//input: datatables obj
//output squel.expr() 
function where_exp(dt) {
  const x = squel.expr();

  // do global searches
  if (dt.search.value){
    let searchable_columns = _.chain(dt.columns)
          .filter( (col) => col.searchable === 'true' )
          .pluck('data')
          .value();
    
    _.each(searchable_columns, (col) => global_search(x, dt ,col));
  }

  // do local searches. 
  _.each(dt.columns, (col) => local_search(x, col));

  return x;
}

/*
 * where_exp helper functions
 */

// this creates the sql search for individual columns
function local_search(expr, column, i) {
    const search = column.search.value;

    if(s.isBlank(search)) {
      return;
    } else if (/^\d+$/.test(search)){ // if number
      let sql = column.data + " = ?";
      let value = s.toNumber(search); // coverts to int. Will not work with decimals. 
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

function global_search(x,dt,columnName) {
  const sql = columnName + " LIKE ?";
  const value = "%" + dt.search.value.toUpperCase() + "%";
  x.or(sql, value);
}

function boundsWhere(dt) {
  const bounds = dt.bounds.split(',');
  return "( (lng_coord BETWEEN " +  bounds[0] + " AND " + bounds[2] + ") AND (lat_coord BETWEEN " + bounds[1] + " AND " + bounds[3] + ") )"; 
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
  return _.mapObject(row, (val, key) => {
    
    if (!val) {
      return val;
    } else if (_.isDate(val)) {
      return `${(val.getUTCMonth() + 1)}-${val.getUTCDate()}-${val.getUTCFullYear()}`;
    } else if (key === 'ownername' || key === 'applicantname') {
      return s.titleize(val.toLowerCase());
    } else {
      return val;
    }
  });

}

const sentence_capitalize = (str) => {
  return _.map(str.toLowerCase().split('. '), (val) => s.capitalize(val))
    .join('. ');
};

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
 }

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

module.exports = {
  do_query: do_query,
  fromFields: fromFields,
  where_exp: where_exp,
  local_search: local_search,
  global_search: global_search,
  boundsWhere: boundsWhere,
  sql_query_builder: sql_query_builder,
  sentence_capitalize: sentence_capitalize,
  change_row: change_row,
  format_bor: format_bor
};
