var sql = {};


sql.dobTable = 'CREATE TABLE dob_jobs (job integer,doc integer,borough varchar(15),house varchar(50),streetName varchar(100),block integer,lot integer,bin integer,jobType varchar(10),jobStatus varchar(50),jobStatusDescrp varchar(50),latestActionDate date,buildingType varchar(20),CB char(3),cluster boolean,landmark boolean,adultEstab boolean,loftBoard boolean,cityOwned boolean,littleE boolean,PCFiled boolean,eFiling boolean,plumbing boolean,mechanical boolean,boiler boolean,fuelBurning boolean,fuelStorage boolean,standPipe boolean,sprinkler boolean,fireAlarm boolean,equipment boolean,fireSuppresion boolean,curbCut boolean,other boolean,otherDescript varchar(50),applicantName varchar(50),applicantTitle varchar(50), professionalLicense varchar(25), professionalCert varchar(20),preFilingDate date,paidDate date,fullyPaidDate date,assignedDate date,approvedDate date,fullyPermitted date,initialCost money,totalEstFee money,feeStatus varchar(10),existZoningSqft integer,proposedZoningSqft integer,horizontalEnlrgmt boolean,verticalEnlrgmt boolean,enlrgmtSqft integer,streetFrontage integer,existStories integer,proposedStories integer,existHeight integer,proposedHeight integer,existDwellUnits integer,proposedDwellUnits integer,existOccupancy varchar(10),proposedOccupany varchar(10),siteFill varchar(50),zoneDist1 varchar(50),zoneDist2 varchar(50),zoneDist3 varchar(50),zoneSpecial1 varchar(50),zoneSpecial2 varchar(50),ownerType varchar(25),nonProfit boolean,ownerName varchar(50),ownerBusinessName varchar(75),ownerHouseStreet varchar(50),ownerCityStateZip varchar(50),ownerPhone varchar(25),jobDescription text,bbl char(10))'

module.exports = sql;