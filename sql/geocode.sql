-- this adds a bbl_lookup table
BEGIN;

-- index bbl
create index on dobjobs (bbl);


CREATE TABLE bbl_lookup (
       lat numeric,
       lng numeric,
       bbl text primary key
);

COPY bbl_lookup(lat, lng, bbl) from '/home/michael/data/pluto/bbl_lat_lng.txt' CSV HEADER;

-- this updates the jobs table with lat/lng from the bbl table. BEGIN;
alter table dobjobs add column lat_coord numeric;
alter table dobjobs add column lng_coord numeric;

update dobjobs
       set lat_coord = bbl_lookup.lat,
       lng_coord = bbl_lookup.lng     
from
   bbl_lookup
where
   bbl_lookup.bbl = dobjobs.bbl;


COMMIT;
