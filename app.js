var express = require('express');
var bodyParser = require('body-parser');
var q = require('q');
var _ = require('underscore');
var s = require("underscore.string");
var through = require('through');
var QueryStream = require('pg-query-stream');
var squel = require('squel')
squel.useFlavour('postgres');
//provide squel.count
squel.count = require('./count_squel');
// my SELECT
squel.mySelect = require('./selectNull');
var pg = require('pg');
  // db settings
  pg.defaults.database = 'dobjobs';
  pg.defaults.host = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost';
  pg.defaults.user = process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || 'mrbuttons';
  pg.defaults.password = process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || 'mrbuttons';
  if (process.env.OPENSHIFT_POSTGRESQL_DB_PORT) {
    pg.defaults.port = process.env.OPENSHIFT_POSTGRESQL_DB_PORT;
  }

//initiate app
var app = express()

//exposes ajax data in req.body
app.use(bodyParser.urlencoded({ extended: false }));

// serve index.html from public folder
app.use(express.static(__dirname + '/public'));
// allow index.html to use js & css folders
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));

// datatables draw
app.get('/datatables', function(req, res){
  //create response object
  var response = {};
  response.draw = req.query.draw;
  // total number of records in database.
  response.recordsTotal = getTotalRecords(req.query.year);
  
  //create SQL query and count query
  var sql_query = sql_query_builder(req.query)[0];
  var countQuery = sql_query_builder(req.query)[1];
  // console.log(sql_query);

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

// get applicant data
app.post('/applicant', function(req, res){
  var sql = applicantQuery(req.body.applicant, req.body.year);
  var applicant_query = do_query_raw(sql)
    .then(function(result){
       res.send(JSON.stringify(result[0]));    
    })
})

app.get('/csv', downloadCSV);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || '3000';
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
//start listening 
var server = app.listen(server_port, server_ip_address, function () {
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

function do_query_raw(sql) {
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

//input: datatables request object, optional: false as second arg to disable limit/offset
//output: [sql-query, count-query]
function sql_query_builder(dt, limit) {
  //these are returned
  var rows_query;
  var count_query;
  //create squel select obj.
  var query = squel.mySelect()
  //parse datatables request

  var tableName = getTableName(dt.year);

  //get fields
  _.each(dt.columns, function(col){
    query.field(col.data);
  })
  // TABLE AND WHERES
  query.from(tableName)
    .where( where_exp(dt) );
  // order if they exist
  if (!_.isEmpty(dt.order)) {
    _.each(dt.order, function(order){
      var direction = (order.dir === "desc") ? false : true;
      query.order(dt.columns[order.column].data, direction)
      if (order.dir === true && order.columnData === 'approveddate') {
        query.nullOrder('FIRST');
      } else {
        query.nullOrder('LAST');
      }
      
    })
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
    .where( where_exp(dt) )
    .toParam();

    return [rows_query, count_query];
}

//input: global search (str or false), [], [], []
//output squel.expr() or blank str
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
        global_search(col)}
      );
  }

    // do local searches. 
    _.each(dt.columns, function(c,i) {
      local_search(c, i)
    });

  return x;

  // where_exp helper functions
  function local_search(column, i) {
    // search = search value
    var search = column.search.value;
    // if blank
    if(s.isBlank(search)) {
      return;
    } 
    // if number
    else if (/^\d+$/.test(search)){
      var sql = column.data + " = ?"
      // coverts to INT. Change to with work with decimals. 
      var value = s.toNumber(search);
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
      // if GeoclientAPI stuff!
      if (column.data === 'address') {
        // nothing here now
      } else {
        var sql = column['data'] + " LIKE ?"
        var value = "%" + column.search.value.toUpperCase() + "%";
        x.and(sql, value);
      }
    }
  }

  function global_search(columnData) {
      var sql = columnData + " LIKE ?";
      var value = "%" + dt.search.value.toUpperCase() + "%";
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

function applicantQuery(name, year) {

  var tableName = getTableName(year);

  return squel.mySelect()
    .field('applicantprofessionaltitle')
    .field('applicantlicense')
    .field('professionalcert')
    .from(tableName)
    .where('applicantname = ?', name)
    .limit(1)
    .toParam();
}

// input: rows from psql query
// output: modified rows
// [ {}, {} ]
function psql_to_dt(rows){

  return _.map(rows, function(row){
      return change_row(row);
  })
}
 
function change_row (row) {
  return _.mapObject(row, function(val, key){
    if (val) {
      if (key === 'latestactiondate' || key === 'approved') {
         if (_.isDate(val)) {
          return '' + (val.getUTCMonth() + 1) + "-" + val.getUTCDate() + "-" + val.getUTCFullYear().toString()
         } else {
          return val.slice(4,15); 
         }
      } else if (key === 'jobdescription') {
        return sentence_capitalize(val);
      } else if (key === 'ownername' || key === 'applicantname') {
        return s.titleize(val.toLowerCase())
      } else if (/existingnoofstories|proposednoofstories|existingdwellingunits|proposeddwellingunits/.test(key)) {
        return val.replace('.0', '');
      } else {
        return val;
      }
    } else {
      return val;
    }
  })
}

function sentence_capitalize(str) {
  var lowercase = str.toLowerCase();
  var capitalized_arr = _.map(lowercase.split('. '), function(val) {
    return s.capitalize(val);
  })
  return capitalized_arr.join('. ');
}

function getTableName(year) {
  var yr = '' + year;
  switch(yr) {
    case '2011':
      return 'jobs_2011';
    case '2012':
      return 'jobs_2012';
    case '2013':
      return 'jobs_2013';
    case '2014':
      return 'jobs_2014';
    case '2015':
      return 'jobs_2015';
    default:
      console.log('error with year in dt request: ' + yr);
      return 'jobs_2014';
  }
}

// returns total records, as of now, this has to be manually updated every month.
function getTotalRecords(year){
   var yr = '' + year;
   switch(yr) {
    case '2011':
      return '67880';
    case '2012':
      return '79935';
    case '2013':
      return '91657';
    case '2014':
      return '106569';
    case '2015':
      return '61274';
    default:
      console.log('error with year in dt request');
      return 'error';
  }
}

function downloadCSV (req, res) {
  // set headers for attachment
  res.set("Content-Disposition", "attachment; filename=\"dobjobs.csv\"")
  res.set('Content-Type', 'text/plain');

  var columnNames = _.map(req.query.columns, function(col){
      return col.data;
  })
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
    // pipe data to responce
    stream.pipe(through(write_one_row), function(){
      // this.queue(null);
      res.end();
    }).pipe(res);
  })
    // transform stream from objects to csv
    function write_one_row(row) {
       var arr = _.map(columnNames, function(name){
          if (!row[name]) {
              return '';
          } else {
              return row[name];
          }
       });
       var csv = arr.join(',') + '\n'
       this.queue(csv);
    }
}

// input address (str)
// output: {}. address.houseNum / address.street / address.borough / address.zip
// still a work in progress (!)
function address_to_bbl(address) {
    var def = q.defer();
    var split = address.split(';')
    var house_street = /(\d+\S*)[ ]+(\w+[ ]?\w*)/.exec(split[0]);
    var house = house_street[1];
    var street = house_street[2];
    var bor = format_bor(split[1]);
  
    var url = 'https://api.cityofnewyork.us/geoclient/v1/address.json?'
    url += 'houseNumber=' + encodeURIComponent(house) + '&street=' + encodeURIComponent(street) + '&borough=' + bor;
    url += '&app_id=a24f63ab&app_key=47bd8f72f07c547b4cfc72e7f0a6ad67';

    request(url, function(err, responce, body) {
      if(err) {
        def.reject(err)
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

