Send bounds + fliters(map.js)
  app.js makes query..



{
   <location field>: {
      $geoWithin: {
         $geometry: {
            type: <"Polygon" or "MultiPolygon"> ,
            coordinates: [ <coordinates> ]
         }
      }
   }
}

db.jobs.find(
  {
    loc: {
      $geoWithin: {
        $geometry: "Polygon",
        coordinates: [array of ]
      }
    }
  }
)

db.jobs.ensureIndex( { loc : "2dsphere" } )


examples of testing mongo
deal with NaN for cost query

best way to have variables in mongo query

This won't work. why?

what the deal with client pools

function removeWhiteSpace(field) {
  if (typeof field === 'string') {
    return field.trim();
  } else {
    var string = String(field);
    removeWhiteSpace(string);
  }
}

db.collection('jobs').find({CB: "304", $or: [ { JobType: "A2"}, { JobType: "A3" } ] })


