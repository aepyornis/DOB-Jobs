## geocode

* add lat/lng to dob_jobs tables via join with postgres
  * get centroid from pluto
  * ensure correct  coordinate system

* shpfile to postgres?


in arcGIS the steps are:
    - pluto
    - FEATURE to POINT
    - convert to WGS84
    - create Lat and Lng fields, calculate geomerty
    - convert BBL field to string
    - filter to only these column: lat, lng, bbl
    - export as table (csv)
