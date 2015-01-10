var errorCounter = 0;
db.jobs2014.find({}).forEach(function(updatedDoc) {
  var bbl = updatedDoc.bbl;
  var nycDoc = db.nyc.findOne({ 'properties.BBL': bbl})
  if (nycDoc) {
    updatedDoc.loc = nycDoc.loc;
    db.jobs.insert(updatedDoc);
  } else {
    errorCounter += 1;
  }
});
print('errors: ');
print(errorCounter);