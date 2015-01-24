var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var q = require('q');
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
  var sql = "SELECT * FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'";
  do_query(sql)
    .then(function(result){
      var stringified = JSON.stringify(result);
      res.send(stringified);
    })
    .then(null, console.error);

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
          def.resolve(result.rows)
          done();
        })
      }
  })
  return def.promise;
}

// function do_query(sql) {
//   pg.connect(function(err, client, done){
//     if (err) {
//         console.log(err);
//     } else {
//         client.query(sql, function(err, result){
//           if (err) {
//             console.log(err);
//           }
//           console.log(result);
//           done();
//         })
//       }
//   })
// }

// do_query("SELECT * FROM dob_jobs WHERE ownerName LIKE '%KENNETH%FRIEDMAN%'");

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
