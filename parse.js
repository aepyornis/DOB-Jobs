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
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var async = require('async');


var options = {
	source_path: 'reallysimple.csv'
};

//reads filename, returns all the lines ['...', '....']
function fileLines(filename, callback) {
	// var theArray = _.rest(data.split('\r'), 2);
	fs.readFile(filename, 'utf8', function(err, data) {
	// console.log(data);
	callback(data.split('\n'));
  });
}

// input:  [String]
// output: [String] ['....','....']
function removeTopTwoRows(rows) {
	return _.rest(rows, 2);
}
//input: string
//output: [string]
function splitRow(row) {
	return row.split(',');
}

//input: [string] ['...', '...']
//output: [[string]], [ ['...'. '...'], ['...','...'] ]
function splitRows(rows) {
	return _.map(rows, splitRow)
}

//input: [ [' string ', ' string '], [],[] ]
//output: [ ['strings', 'string'], [],[] ]
function removeWhiteSpace(splitRows){
	for (var i = 0; i < splitRows.length; i++) {
			for (var p = 0; p < splitRows[i].length; p++) {
				splitRows[i][p] = splitRows[i][p].replace(/^\s+|\s+$/g,'');
			}
	 	}
	return splitRows;
}

//input: string, string, string
//output: string (10 char)
function bbl(borough, block, lot) {
	var bor;
	var blk = block;
	var lt = lot;
	if (borough === 'MANHATTAN') {
		bor = '1';
	} else if (borough === 'BRONX') {
		bor = '2';
	} else if (borough === 'BROOKLYN') {
		bor = '3';
	} else if (borough === 'QUEENS') {
		bor = '4';
	} else if (borough === 'STATEN ISLAND') {
		bor = '5';
	} else { bor = 'err'; console.log("there's a mistake with the borough name");}

	if (block.length > 5 || lot.length > 4) {
		console.log("the block and/or lot are too long")
	} else {
		while (blk.length < 5) {
			blk = '0' + blk;
		}
		while (lt.length < 4) {
			lt = '0' + lt;
		}
		return (bor + blk + lt);
	}
}



//input: i (index of for loop), [[]]
//output: {}
function permitConstructor(i, allPermits) {
	var permit = {}
	permit.job = allPermits[i][0];
	permit.doc = allPermits[i][1];
	permit.borough = allPermits[i][2];
	permit.house = allPermits[i][3];
	permit.streetName = allPermits[i][4];
	permit.block = allPermits[i][5];
	permit.lot = allPermits[i][6;
	permit.bin = allPermits[i][7];
	permit.jobType = allPermits[i][8];
	permit.jobStatus = allPermits[i][9];
	permit.jobStatusDescrp = allPermits[i][10];
	permit.latestActionDate = allPermits[i][11];
	permit.buildingType = allPermits[i][12];
	permit.CB = allPermits[i][13];
	permit.cluster = allPermits[i][14];
	permit.landmark = allPermits[i][15];
	permit.
	return permit;
}


//input: [[]], 'name of collection'
//output: writes documents to mongoDB
function mongoInsert(thePermits, nameOfCollection, callback) {
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) throw err;
	
		//creates write queue
		var q = async.queue(function(task, callback) {
			var documentToBeAdded = task.doc;
	  		db.collection(nameOfCollection).insert(documentToBeAdded, {w:1}, function(err, docs) {
				callback();
			});
	  	}, 2)

		//pushes documents to the queue
	  	for (var i = 0; i < thePermits.length; i++) {
	  		q.push({doc: permitConstructor(i, thePermits)}, function(err){
	  			if(err) {
	  				console.log(err);
	  			}
	  		});
	  	}
	  	//function called when queue is finished
	  	q.drain = function() {
	  		db.close();
	  		//option callback-used in testing
	  		typeof callback === 'function' && callback();
	  	}
	})
}


module.exports = {
	fileLines: fileLines,
	removeTopTwoRows: removeTopTwoRows,
	splitRow: splitRow,
	splitRows: splitRows,
	permitConstructor: permitConstructor,
	mongoInsert: mongoInsert,
	removeWhiteSpace: removeWhiteSpace,
	bbl: bbl
}

Job #,Doc #,Borough,House #,Street Name,Block,Lot,Bin #,Job Type,Job Status,Job Status Descrp,Latest Action Date,Building Type,Community - Board,Cluster ,Landmarked,Adult Estab,Loft Board,City Owned,Little e,PC Filed,eFiling Filed,Plumbing,Mechanical,Boiler,Fuel Burning,Fuel Storage,Standpipe,Sprinkler,Fire Alarm,Equipment,Fire Suppression,Curb Cut,Other,Other Description,Applicant's First/Last Name,Applicant Professional Title,Applicant License #,Professional Cert,Pre- Filing Date,Paid,Fully Paid,Assigned,Approved,Fully Permitted,Initial Cost,Total Est. Fee,Fee Status,Existing Zoning Sqft,Proposed Zoning Sqft,Horizontal Enlrgmt,Vertical Enlrgmt,Enlargement SQ Footage,Street Frontage,ExistingNo. of Stories,Proposed No. of Stories,Existing Height,Proposed Height,Existing Dwelling Units,Proposed Dwelling Units,Existing Occupancy,Proposed Occupancy,Site Fill,Zoning Dist1,Zoning Dist2,Zoning Dist3,Special District 1,Special District 2,Owner Type,Non-Profit,Owner's First & Last Name,Owner's Business Name ,Owner's  House Street,(City, State, Zip),Owners Phone #,Job Description



