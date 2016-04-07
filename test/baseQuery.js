module.exports = "SELECT house || ' ' || streetname || ', ' || zip as address, "  
      + "latestactiondate, communityboard, jobtype, "
      + "ownersfirstname || ' ' || ownerslastname as ownername, "
      + "ownersbusinessname, jobdescription, approved, existingnoofstories, proposednoofstories, "
      + "existingdwelling, proposeddwellingunits, initialcost, "
      + "applicantsfirstname || ' ' || applicantsfirstname as applicantname, "
      + "bbl, lat_coord, lng_coord "
      + "FROM dobjobs ";
