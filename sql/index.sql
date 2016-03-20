-- create pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- year
CREATE INDEX ON jobs (sourceyear);

-- multi-column index
CREATE INDEX ON jobs (lat_coord, lng_coord);

-- lat
create index on jobs (lat_coord);

-- lng
create index on jobs (lng_coord);

-- Latest Action Date 
 CREATE INDEX ON jobs (latestactiondate DESC NULLS LAST);
 CREATE INDEX ON jobs (latestactiondate DESC);
 
--latestactiondate + lat/lng
create index on jobs (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);

-- jobtype index
CREATE INDEX ON jobs (jobtype);

-- owner businessname
create index on jobs USING gin (ownerbusinessname gin_trgm_ops);

-- owner name
create index on jobs USING gin (ownername gin_trgm_ops);

-- community board
CREATE INDEX on jobs (communityboard);

--job description
create index on jobs USING gin (jobdescription gin_trgm_ops);

create index on jobs (bbl);
