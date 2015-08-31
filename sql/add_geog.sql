BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

alter table jobs_2015 add column geog geography(POINT, 4326);

update jobs_2015
       SET geog = ST_SetSRID(ST_MakePoint(lng_coord, lat_coord), 4326);

COMMIT;
