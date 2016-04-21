-- create pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- multi-column index
create index on dobjobs (lat_coord, lng_coord);
-- lat
create index on dobjobs (lat_coord);
-- lng
create index on dobjobs (lng_coord);

-- Latest Action Date 
create index on dobjobs (LatestActionDate DESC NULLS LAST);
create index on dobjobs (LatestActionDate DESC);
 
--latestactiondate + lat/lng
create index on dobjobs (lat_coord, lng_coord, LatestActionDate DESC NULLS LAST);

-- jobtype
create index on dobjobs (JobType);
-- job status
create index on dobjobs (JobStatus);
-- community board
create index on dobjobs (CommunityBoard);
-- existing/proposed # of stories
create index on dobjobs (ExistingNoofStories);
create index on dobjobs (ProposedNoofStories);

-- FULL TEXT search columns

-- owner businessname
create index on dobjobs USING gin (OwnersBusinessName gin_trgm_ops);
-- owner name
create index on dobjobs USING gin (ownername gin_trgm_ops);
--job description
create index on dobjobs USING gin (JobDescription gin_trgm_ops);
--applicant name
create index on dobjobs USING gin (applicantname gin_trgm_ops);


