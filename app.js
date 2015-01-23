var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var q = require('q');

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
  var sql = "SELECT * FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%')";
  do_query(sql)
    .then(app.res(JSON.stringify(result)));

})

function do_query(sql) {
  var def = q.defer();
  pg.connect(function(err, client, done){
    if (err) {
        def.reject(new Error('error fetching client from pool'));
    } else {
        client.query(sql, function(err, result){
          if (err) {
            def.reject(new Error('error executing query'));
          }
          def.resolve(result.rows[0])
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
