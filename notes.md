
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

BEGIN TRANSACTION;

CREATE TABLE bbl_lookup (
    lat numeric,
    lng numeric,
    bbl text primary key
);

COPY bbl_lookup(lat, lng, bbl) from 'd:/gis/Bytes of the big apple/MapPluto15v1/nyc/bbl_lat_lng.txt' CSV HEADER;


end transaction;

alter table jobs_2015 add column lat numeric;
alter table jobs_2015 add column lng numeric;





