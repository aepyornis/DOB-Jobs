-- this adds a bbl_lookup table
BEGIN;

CREATE TABLE bbl_lookup (
       lat numeric,
       lng numeric,
       bbl text primary key
);

COPY bbl_lookup(lat, lng, bbl) from 'bbl_lat_lng.txt' CSV HEADER;

COMMIT;

-- this updates the jobs table with lat/lng from the bbl table. 
BEGIN;

alter table jobs add column lat_coord numeric;
alter table jobs add column lng_coord numeric;

update jobs
       set lat_coord = bbl_lookup.lat,
       lng_coord = bbl_lookup.lng     
from
   bbl_lookup
where
   bbl_lookup.bbl = jobs.bbl;

COMMIT;
