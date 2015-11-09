-- create view of DISTINCTS:
CREATE VIEW unique_jobs AS  SELECT DISTINCT  on (job) * FROM JOBS ORDER BY job, latestactiondate DESC;

-- counts unique_jobs
SELECT COUNT(*) FROM (unique_jobs) as x;

-- counts total of each job type
-- with duplicates
SELECT jobtype, count(*) from jobs GROUP BY jobtype;
-- without duplicates
SELECT jobtype, count(*) from unique_jobs GROUP BY jobtype;

-- get list of all jobs ordered by how many times they appear
SELECT job, count(job) as count FROM jobs GROUP BY job ORDER BY count DESC;

-- get  list of jobs that are duplicates
SELECT * from (SELECT job, count(job)  as count FROM jobs GROUP BY job) as x  WHERE count > 1 ORDER BY count DESC;
-- include jobtype
SELECT * from (SELECT job, count(job) as count, jobtype FROM jobs GROUP BY job, jobtype) as x  WHERE count > 1 ORDER BY count DESC;


-- count duplicates
select count(*) from (SELECT * from (SELECT job, count(job) as count FROM jobs GROUP BY job) as x  WHERE count > 1) as x;
-- count duplicates that includes jobtype in group by statement
select count(*) from (SELECT * from (SELECT job, count(job) as count, jobtype FROM jobs GROUP BY job, jobtype) as x  WHERE count > 1) as x;
-- the above two queries should be the same -- this means that t what we think of as 'one' job. Sometimes the destrictipon does change.

-- All A1 filed uniqe jobs
SELECT * FROM unique_jobs where jobtype = 'A1'

COPY (SELECT * FROM unique_jobs where jobtype = 'A1') TO 'D:\A1.csv' CSV HEADER
COPY () TO 'C:\cygwin64\home\ziggy\code\DOB-Jobs\out' CSV HEADER:
COPY () TO 'C:\cygwin64\home\ziggy\code\DOB-Jobs\out' CSV HEADER:

C:\cygwin64\home\ziggy\code\DOB-Jobs\out


job,doc,borough,house,streetname,block,lot,bin,jobtype,jobstatus,jobstatusdescrp,latestactiondate,buildingtype,communityboard,cluster,landmarked,adultestab,loftboard,cityowned,littlee,pcfiled,efilingfiled,plumbing,mechanical,boiler,fuelburning,fuelstorage,standpipe,sprinkler,firealarm,equipment,firesuppression,curbcut,other,otherdescription,applicantname,applicantprofessionaltitle,applicantlicense,professionalcert,prefilingdate,paid,fullypaid,assigned,approved,fullypermitted,initialcost,totalestfee,feestatus,existingzoningsqft,proposedzoningsqft,horizontalenlrgmt,verticalenlrgmt,enlargementsqfootage,streetfrontage,existingnoofstories,proposednoofstories,existingheight,proposedheight,existingdwellingunits,proposeddwellingunits,existingoccupancy,proposedoccupancy,sitefill,zoningdist1,zoningdist2,zoningdist3,specialdistrict1,specialdistrict2,ownertype,nonprofit,ownername,ownerbusinessname,ownerhousestreet,citystatezip,ownerphone,jobdescription,address,bbl,sourceyear,lat_coord,lng_coord

SELECT job, address, borough, bbl, bin, jobtype,jobstatus,jobstatusdescrp,latestactiondate,buildingtype,communityboard, prefilingdate,paid,fullypaid,assigned,approved,fullypermitted,initialcost,totalestfee,feestatus,existingzoningsqft,proposedzoningsqft,horizontalenlrgmt,verticalenlrgmt,enlargementsqfootage,streetfrontage,existingnoofstories,proposednoofstories,existingheight,proposedheight,existingdwellingunits,proposeddwellingunits,existingoccupancy,proposedoccupancy,sitefill,zoningdist1,zoningdist2,zoningdist3,specialdistrict1,specialdistrict2,ownertype,nonprofit,ownername,ownerbusinessname,ownerhousestreet,citystatezip, sourceyear,lat_coord,lng_coord FROM unique_jobs

COPY (SELECT job, address, borough, bbl, bin, jobtype,jobstatus,jobstatusdescrp,latestactiondate,buildingtype,communityboard, prefilingdate,paid,fullypaid,assigned,approved,fullypermitted,initialcost,totalestfee,feestatus,existingzoningsqft,proposedzoningsqft,horizontalenlrgmt,verticalenlrgmt,enlargementsqfootage,streetfrontage,existingnoofstories,proposednoofstories,existingheight,proposedheight,existingdwellingunits,proposeddwellingunits,existingoccupancy,proposedoccupancy,sitefill,zoningdist1,zoningdist2,zoningdist3,specialdistrict1,specialdistrict2,ownertype,nonprofit,ownername,ownerbusinessname,ownerhousestreet,citystatezip, sourceyear,lat_coord,lng_coord FROM unique_jobs) TO 'D:\limitedJobs.csv' CSV HEADER;
