'use strict';
const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');

const q = require('q');
const _ = require('lodash');
const titleize = require("underscore.string/titleize");
const capitalize = require("underscore.string/capitalize");
const toNumber = require("underscore.string/toNumber");
const through = require('through');

const squel = require('squel');
const pgsquel = squel.useFlavour('postgres');
squel.mySelect = require('./selectNull'); // Select with Null Order

const pg = require('pg');
const QueryStream = require('pg-query-stream');
// db settings
pg.defaults.database = config.database;
pg.defaults.host = config.host;
pg.defaults.user =  config.user;
pg.defaults.password = config.password;

//initiate app
const app = express();

var totalRecords = null;
getTotalRecords().done( count => totalRecords = count);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(config.publicFolder));
app.use("/js", express.static(config.publicFolder + '/js'));
app.use("/css", express.static(config.publicFolder + '/css'));

// datatables draw
app.get('/datatables', (req, res) => {
  const response = {}; //create response object
  response.draw = req.query.draw;
  response.recordsTotal = totalRecords;
  // get sql queries
  const [sqlQuery, countQuery] = sql_query_builder(req.query);
  
  const count_promise = do_query(countQuery)
          .then( result => response.recordsFiltered = result[0].c);

  const sql_promise = do_query(sqlQuery)
          .then( rows => response.data = _.map(rows,change_row));

  const sendJSON = () => res.json(response);
  const handleError = (err) => res.json({error: 'postgres error: ' + err});
  
  q.all([count_promise, sql_promise]).then(sendJSON, handleError);

});

app.get('/csv', downloadCSV);
app.get('/cd', recordsByCD);
//start listening 
const server = app.listen(config.port, config.ip, ()=> {
  let {address, port} = server.address();
  console.log('app listening at http://%s:%s', address, port);
});

function do_query(sql) {
  const def = q.defer();
  pg.connect((err, client, done) => {
    if (err) {
        def.reject(err);
    } else {
        client.query(sql, (err, result)=> {
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

  const query = squel.mySelect({numberedParameters: true}); //create squel select obj.
  
  _.each(dt.columns, (col) => fromFields(col.data, query)); // get fiends (SELECT)
  query.from(config.tableName); // FROM
  query.where( where_exp(dt) ); // WHERE
  
  // lat/lng constraints 
  if (dt.mapVisible === 'true' && dt.bounds) {
    query.where( boundsWhere(dt) );
  }
  
  // order if necessary
  if (!_.isEmpty(dt.order)) {
    _.each(dt.order, (order) => {
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
    .from(config.tableName)
    .where( where_exp(dt) );

  return [query.toParam(), count_query.toParam()];
}

// input: str, object
function fromFields(field, query) {
  query.field(field);
}

//input: datatables obj
//output squel.expr() 
function where_exp(dt) {
  const x = squel.expr();

  // do global searches
  if (dt.search.value){
      _(dt.columns)
        .filter(['searchable', 'true'])  
        .map('data')
        .each( col => global_search(x, dt, col));
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

  if (search === '') {
      return;
  } else if (/^\d+$/.test(search)){ // if number
      let sql = column.data + " = ?";
      let value = toNumber(search); // coverts to int. Will not work with decimals. 
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

function change_row (row) {
  return _.mapValues(row, (val, key) => {
    
    if (!val) {
      return val;
    } else if (_.isDate(val)) {
      return `${(val.getUTCMonth() + 1)}-${val.getUTCDate()}-${val.getUTCFullYear()}`;
    } else if (key === 'ownername' || key === 'applicantname') {
      return titleize(val.toLowerCase());
    } else {
      return val;
    }
  });

}

const sentence_capitalize = (str) => {
  return _.map(str.toLowerCase().split('. '), (val) => capitalize(val))
    .join('. ');
};

function getTotalRecords(){
  return do_query("SELECT COUNT(*) as count FROM " + config.tableName)
    .get(0).get('count');
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

function cdRecordsSql(cd, limit) {
  return pgsquel.select()
    .from(config.tableName)
    .where("communityboard = ?", cd)
    .order("latestactiondate", false)
    .limit(limit)
    .toParam();
}

function recordsByCD(req, res) {
  if (_.isNil(req.query.cd)) {
    return res.sendStatus(404);
  }
  const limit = (req.query.limit) ? req.query.limit : 10;
  const sql = cdRecordsSql(req.query.cd, limit);

  do_query(sql)
    .then( 
      result => res.json(result), 
      err => {console.log(err); res.sendStatus(404); });
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
  format_bor: format_bor,
  getTotalRecords: getTotalRecords,
  cdRecordsSql: cdRecordsSql
};
