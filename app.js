var express = require('express')
var app = express()

//required for ajax to work//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//GET requests
app.get('/', function (req, res) {
  console.log('someone\'s here');
  res.send('welcome to the dob-jobs map maddness!')
})

//PUT request
app.post('/request', function(req, res) {
  console.log('requst in');
  res.send('right back at ya');
})


//start listening
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
