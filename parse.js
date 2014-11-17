//Parse DOB
//STEPS
// Readfile
// turn csv into array
// remove top 2 rows
// turn into array of objects with: 
// 	string to numbers, numbers to strings
// 	write headers
// 	create BBL field
// write each object to mongo collection
var fs = require('fs');
var _ = require('underscore');






var options = {
	source_path: 'reallysimple.csv'
};

//reads filename, returns all the lines
function fileLines(filename, callback) {
	// var theArray = _.rest(data.split('\r'), 2);
	fs.readFile(filename, 'utf8', function(err, data) {
	// console.log(data);
	callback(data.split('\n'));
  });
}

module.exports = {
	fileLines: fileLines
}
// 	var contents = data.split('\n');
// 	return contents


// '..............' -> [ 'entireRows', 'entireRows'] - > [ ['field1', 'field2'], ['field1', 'field2']


// 	theArray = _.rest(theArray, 2);
// theArray = _.map(theArray, function(string) {
// 		string.split(',');
// 	});
// 	console.log(theArray);

// // [ '...', '....'. '....']

// var arrayOfObjects =[];
// for (var i = 0; i < theArray.length; i++) {
// 	var object 
// 	theArray[i]

// }

// // Job #,Doc #,Borough,House #,Street Name,Block,Lot,Bin #,Job Type,Job Status,Job Status Descrp,Latest Action Date,Building Type,Community - Board,Cluster ,Landmarked,Adult Estab,Loft Board,City Owned,Little e,PC Filed,eFiling Filed,Plumbing,Mechanical,Boiler,Fuel Burning,Fuel Storage,Standpipe,Sprinkler,Fire Alarm,Equipment,Fire Suppression,Curb Cut,Other,Other Description,Applicant's First/Last Name,Applicant Professional Title,Applicant License #,Professional Cert,Pre- Filing Date,Paid,Fully Paid,Assigned,Approved,Fully Permitted,Initial Cost,Total Est. Fee,Fee Status,Existing Zoning Sqft,Proposed Zoning Sqft,Horizontal Enlrgmt,Vertical Enlrgmt,Enlargement SQ Footage,Street Frontage,ExistingNo. of Stories,Proposed No. of Stories,Existing Height,Proposed Height,Existing Dwelling Units,Proposed Dwelling Units,Existing Occupancy,Proposed Occupancy,Site Fill,Zoning Dist1,Zoning Dist2,Zoning Dist3,Special District 1,Special District 2,Owner Type,Non-Profit,Owner's First & Last Name,Owner's Business Name ,Owner's  House Street,"City, State, Zip",Owner's  Phone #,Job Description

// singlePermit = {
// 	job: 

// }








