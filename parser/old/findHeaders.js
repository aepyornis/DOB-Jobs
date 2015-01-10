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



{ 'permit.Job: allPermits[i][0],
  'Doc #': allPermits[i]1',
  Borough: '2',
  'House #': '3',
  'Street Name': '4',
  Block: '5',
  Lot: '6',
  'Bin #': '7',
  'Job Type': '8',
  'Job Status': '9',
  'Job Status Descrp': '10',
  'Latest Action Date': '11'
  'Building Type': '12',
  'Community - Board': '13',
  'Cluster ': '14',
  Landmarked: '15',
  'Adult Estab': '16',
  'Loft Board': '17',
  'City Owned': '18',
  'Little e': '19',
  'PC Filed': '20',
  'eFiling Filed': '21',
  Plumbing: '22',
  Mechanical: '23',
  Boiler: '24',
  'Fuel Burning': '25',
  'Fuel Storage': '26',
  Standpipe: '27',
  Sprinkler: '28',
  'Fire Alarm': '29',
  Equipment: '30',
  'Fire Suppression': '31',
  'Curb Cut': '32',
  Other: '33',
  'Other Description': '34',
  'Applicant\'s First/Last N
  'Applicant Professional Ti
  'Applicant License #': '37
  'Professional Cert': '38',
  'Pre- Filing Date': '39',
  Paid: '40',
  'Fully Paid': '41',
  Assigned: '42',
  Approved: '43',
  'Fully Permitted': '44',
  'Initial Cost': '45',
  'Total Est. Fee': '46',
  'Fee Status': '47',
  'Existing Zoning Sqft': '4
  'Proposed Zoning Sqft': '4
  'Horizontal Enlrgmt': '50'
  'Vertical Enlrgmt': '51',
  'Enlargement SQ Footage':
  'Street Frontage': '53',
  'ExistingNo. of Stories':
  'Proposed No. of Stories':
  'Existing Height': '56',
  'Proposed Height': '57',
  'Existing Dwelling Units':
  'Proposed Dwelling Units':
  'Existing Occupancy': '60'
  'Proposed Occupancy': '61'
  'Site Fill': '62',
  'Zoning Dist1': '63',
  'Zoning Dist2': '64',
  'Zoning Dist3': '65',
  'Special District 1': '66'
  'Special District 2': '67'
  'Owner Type': '68',
  'Non-Profit': '69',
  'Owner\'s First & Last Nam
  'Owner\'s Business Name ':
  'Owner\'s  House Street':
  '(City': '73',
  ' State': '74',
  ' Zip)': '75',
  'Owners Phone #': '76',
  'Job Description': '77' }