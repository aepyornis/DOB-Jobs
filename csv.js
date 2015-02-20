var pg = require('pg')
var QueryStream = require('pg-query-stream')
var JSONStream = require('JSONStream')

var toCSV = through(write_one_row, function end(){ this.queue(null); });


function ()

var columnNames = _.map(dt.columns, function(col){
    return col.data;
})

pg.connect(function(err, client, done) {
  if(err) throw err;
  var query = new QueryStream('SELECT address,jobtype FROM jobs_2014')
  var stream = client.query(query)
  //release the client when the stream is finished
  stream.on('end', done);

  stream.pipe(through(write_one_row)).pipe(process.stdout);
})


function write_one_row(row) {
   var arr = _.map(columnNames, function(name){
        if (!row[name]) {
            return '';
        } else {
            return row[name];
        }
   });
   var csv = data.join(',') + '\n'
   this.queue(csv);
}


