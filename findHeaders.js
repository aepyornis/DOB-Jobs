var _ = require('underscore');

var headers = "Job #,Doc #,Borough,House #,Street Name,Block,Lot,Bin #,Job Type,Job Status,Job Status Descrp,Latest Action Date,Building Type,Community - Board,Cluster ,Landmarked,Adult Estab,Loft Board,City Owned,Little e,PC Filed,eFiling Filed,Plumbing,Mechanical,Boiler,Fuel Burning,Fuel Storage,Standpipe,Sprinkler,Fire Alarm,Equipment,Fire Suppression,Curb Cut,Other,Other Description,Applicant's First/Last Name,Applicant Professional Title,Applicant License #,Professional Cert,Pre- Filing Date,Paid,Fully Paid,Assigned,Approved,Fully Permitted,Initial Cost,Total Est. Fee,Fee Status,Existing Zoning Sqft,Proposed Zoning Sqft,Horizontal Enlrgmt,Vertical Enlrgmt,Enlargement SQ Footage,Street Frontage,ExistingNo. of Stories,Proposed No. of Stories,Existing Height,Proposed Height,Existing Dwelling Units,Proposed Dwelling Units,Existing Occupancy,Proposed Occupancy,Site Fill,Zoning Dist1,Zoning Dist2,Zoning Dist3,Special District 1,Special District 2,Owner Type,Non-Profit,Owner's First & Last Name,Owner's Business Name ,Owner's  House Street,(City, State, Zip),Owners Phone #,Job Description"

function printFields(string) {
	var theArray = string.split(',');
	var theObject = {};
	for (i = 0; i < theArray.length; i++) {
		theObject[i] = theArray[i];
	}
	// console.log(JSON.stringify(theObject, null, 2));
	return theObject;
}

var theHeaders = printFields(headers);

var invertedHeaders = _.invert(theHeaders);

console.log(invertedHeaders);

