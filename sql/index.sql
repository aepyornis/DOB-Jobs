-- create pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- multi-column index
CREATE INDEX ON jobs_2015 (lat_coord, lng_coord);
CREATE INDEX ON jobs_2014 (lat_coord, lng_coord);
CREATE INDEX ON jobs_2013 (lat_coord, lng_coord);
CREATE INDEX ON jobs_2012 (lat_coord, lng_coord);
CREATE INDEX ON jobs_2011 (lat_coord, lng_coord);

-- lat
create index on jobs_2015 (lat_coord);
create index on jobs_2014 (lat_coord);
create index on jobs_2013 (lat_coord);
create index on jobs_2012 (lat_coord);
create index on jobs_2011 (lat_coord);

-- lng
create index on jobs_2015 (lng_coord);
create index on jobs_2014 (lng_coord);
create index on jobs_2013 (lng_coord);
create index on jobs_2012 (lng_coord);
create index on jobs_2011 (lng_coord);

-- Latest Action Date 
 CREATE INDEX ON jobs_2015 (latestactiondate DESC NULLS LAST);
 CREATE INDEX ON jobs_2014 (latestactiondate DESC NULLS LAST);
 CREATE INDEX ON jobs_2013 (latestactiondate DESC NULLS LAST);
 CREATE INDEX ON jobs_2012 (latestactiondate DESC NULLS LAST);
 CREATE INDEX ON jobs_2011 (latestactiondate DESC NULLS LAST);

--latestactiondate + lat/lng
create index on jobs_2015 (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);
create index on jobs_2014 (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);
create index on jobs_2013 (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);
create index on jobs_2012 (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);
create index on jobs_2011 (lat_coord, lng_coord, latestactiondate DESC NULLS LAST);

-- jobtype index
CREATE INDEX ON jobs_2015 (jobtype);
CREATE INDEX ON jobs_2014 (jobtype);
CREATE INDEX ON jobs_2013 (jobtype);
CREATE INDEX ON jobs_2012 (jobtype);
CREATE INDEX ON jobs_2011 (jobtype);

-- owner businessname
create index on jobs_2015 USING gin (ownerbusinessname gin_trgm_ops);
create index on jobs_2014 USING gin (ownerbusinessname gin_trgm_ops);
create index on jobs_2013 USING gin (ownerbusinessname gin_trgm_ops);
create index on jobs_2012 USING gin (ownerbusinessname gin_trgm_ops);
create index on jobs_2011 USING gin (ownerbusinessname gin_trgm_ops);

-- owner name
create index on jobs_2015 USING gin (ownername gin_trgm_ops);
create index on jobs_2014 USING gin (ownername gin_trgm_ops);
create index on jobs_2013 USING gin (ownername gin_trgm_ops);
create index on jobs_2012 USING gin (ownername gin_trgm_ops);
create index on jobs_2011 USING gin (ownername gin_trgm_ops);

-- community board
CREATE INDEX on jobs_2015 (communityboard);
CREATE INDEX on jobs_2014 (communityboard);
CREATE INDEX on jobs_2013 (communityboard);
CREATE INDEX on jobs_2012 (communityboard);
CREATE INDEX on jobs_2011 (communityboard);

--job description
create index on jobs_2015 USING gin (jobdescription gin_trgm_ops);
create index on jobs_2014 USING gin (jobdescription gin_trgm_ops);
create index on jobs_2013 USING gin (jobdescription gin_trgm_ops);
create index on jobs_2012 USING gin (jobdescription gin_trgm_ops);
create index on jobs_2011 USING gin (jobdescription gin_trgm_ops);

-- bbl
create index on jobs_2015 (bbl);
create index on jobs_2014 (bbl);
create index on jobs_2013 (bbl);
create index on jobs_2012 (bbl);
create index on jobs_2011 (bbl);

