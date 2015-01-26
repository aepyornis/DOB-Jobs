var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var q = require('q');
var _ = require('underscore');
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

//get request
app.get('/query', function(req, res){
  console.log('requst in');
  var sql = "SELECT house, streetName, bbl, latestActionDate, buildingType, existStories, proposedStories, ownerName, ownerBusinessName, jobDescription FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'";
  do_query(sql)
    .then(function(result){
      var stringified = JSON.stringify(result);
      res.send(stringified);
      // res.send('hi there')
    })
    .then(null, console.error);
})

//post request
app.post('/datatables', function(req, res){

  console.log('requst in');
  
  var response = {};
  response.draw = req.body.draw;
  response.recordsTotal = 106569; 
  
  var sql = "SELECT house, streetName, bbl, latestActionDate, buildingType, existStories, proposedStories, ownerName, ownerBusinessName, jobDescription FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'";
  var countQuery = "SELECT COUNT (*) as c FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'";

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
    } else {
        client.query(sql, function(err, result){
          if (err) {
            def.reject(err);
          }
          def.resolve(result.rows); 
          done();
        })
      }
  })
  return def.promise;
}




//start listening 
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port)
})


//graveyard
//POST request
// app.post('/request', function(req, res) {
//   console.log('requst in');
//   //extract requestData from request
//   var requestData = JSON.parse(req.body.json);
// })
