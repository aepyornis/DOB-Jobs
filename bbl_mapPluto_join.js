db.jobs2014.find({}).limit(3).forEach(function(updatedDoc) {
  var bbl = updatedDoc.bbl;
  updatedDoc.loc = db.nyc.findOne({ 'properties.BBL': bbl}).loc;
  db.jobs.insert(updatedDoc);
})