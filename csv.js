var pg = require('pg')
var QueryStream = require('pg-query-stream')
var JSONStream = require('JSONStream')

var writeStream = fs.createWriteStream('mycsv.csv');
//pipe 1,000,000 rows to stdout without blowing up your memory usage
pg.connect(function(err, client, done) {
  if(err) throw err;
  var query = new QueryStream('SELECT * FROM dob_jobs LIMIT 2')
  var stream = client.query(query)
  //release the client when the stream is finished
  stream.on('end', function(){
    res.end(done);
    done();
  })
  steam.on('data', write_one_row)
})


var columnNames = _.map(dt.columns, function(col){
    return col.data;
})

function write_one_row(row) {
   var data = _.map(columnNames, function(name){
        if (!row[name]) {
            return '';
        } else {
            return row[name];
        }

   });
   res.write(data.join(','));
   res.write('\n')
}



writeStream.pipe(res.send);