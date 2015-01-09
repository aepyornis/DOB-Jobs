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