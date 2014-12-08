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
// map
// filtering capabilities 
// Select permits where: ... ... 

// D:\mongodb\bin\mongod.exe --dbpath D:\code\DOB-Jobs\database

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
	if (err) console.log(err);
	callback(data.split('\n'));
  });
}

// input:  [String]
// output: [String] ['....','....']
function removeTopThreeRows(rows) {
	return _.rest(rows, 3);
}

//input: string
//output: [string]
function splitRow(row) {
	return row.split(',');
}

//input: [string] ['...', '...']
//output: [[string]], [ ['...', '...'], ['...','...'] ]
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
	} else { bor = 'err'; console.log("there's a mistake with the borough name: " + borough );}

	if (block != undefined || lot != undefined) {
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
	} else {
		return 'blk and/or lot is undefined';
	}

	
}


//input: i (index of for loop), [[]]
//output: {}
function permitConstructor(i, allPermits) {
	var permit = {}
	permit.Job = allPermits[i][0];
	permit.Doc = allPermits[i][1];
	permit.Borough = allPermits[i][2];
	permit.House = allPermits[i][3];
	permit.StreetName = allPermits[i][4];
	permit.Block = allPermits[i][5];
	permit.Lot = allPermits[i][6];
	permit.Bin = allPermits[i][7];
	permit.JobType = allPermits[i][8];
	permit.JobStatus = allPermits[i][9];
	permit.JobStatusDescrp = allPermits[i][10];
	permit.LatestActionDate = dateParser(allPermits[i][11]);
	permit.BuildingType = allPermits[i][12];
	permit.CB = allPermits[i][13];
	permit.Cluster = allPermits[i][14];
	permit.Landmark = allPermits[i][15];
	permit.AdultEstab = allPermits[i][16];
	permit.LoftBoard = allPermits[i][17];
	permit.CityOwned = allPermits[i][18];
	permit.LittleE = allPermits[i][19];
	permit.PCFiled = allPermits[i][20];
	permit.eFilingFiled = allPermits[i][21];
	permit.Plumbing = allPermits[i][22];
	permit.Mechanical = allPermits[i][23];
	permit.Boiler = allPermits[i][24];
	permit.FuelBurning = allPermits[i][25];
	permit.FuelStorage = allPermits[i][26];
	permit.Standpipe = allPermits[i][27];
	permit.Sprinkler = allPermits[i][28];
	permit.FireAlarm = allPermits[i][29];
	permit.Equipment = allPermits[i][30];
	permit.FireSuppression = allPermits[i][31];
	permit.CurbCut = allPermits[i][32];
	permit.Other = allPermits[i][33];
	permit.OtherDescript = allPermits[i][34];
	permit.Applicant = {};
	permit.Applicant.Name =  allPermits[i][35];
	permit.Applicant.Title = allPermits[i][36];
	permit.Applicant.License = allPermits[i][37];
	permit.Applicant.ProfessionalCert = allPermits[i][38];
	permit.PreFilingDate = dateParser(allPermits[i][39]);
	permit.Paid = dateParser(allPermits[i][40]);
	permit.FullyPaid = dateParser(allPermits[i][41]);
	permit.Assigned = dateParser(allPermits[i][42]);
	permit.Approved = dateParser(allPermits[i][43]);
	permit.FullyPermitted = dateParser(allPermits[i][44]);
	permit.InitialCost = parseInt(removesMoneySign(allPermits[i][45]));
	permit.TotalEstFee = parseInt(removesMoneySign(allPermits[i][46]));
	permit.FeeStatus = allPermits[i][47];
	permit.ExistingZoningSqft = parseInt(allPermits[i][48]);
	permit.ProposedZoningSqft = parseInt(allPermits[i][49]);
	permit.HorizontalEnlrgmt = parseInt(allPermits[i][50]);
	permit.VerticalEnlrgmt = parseInt(allPermits[i][51]);
	permit.EnlargementSQFootage = parseInt(allPermits[i][52]);
	permit.StreetFrontage = allPermits[i][53];
	permit.ExistingStories = parseInt(allPermits[i][54]);
	permit.ProposedStories = parseInt(allPermits[i][55]);
	permit.ExistingHeight = parseInt(allPermits[i][56]);
	permit.ProposedHeight = parseInt(allPermits[i][57]);
	permit.ExistingDwellingUnits = parseInt(allPermits[i][58]);
	permit.ProposedDwellingUnits = parseInt(allPermits[i][59]);
	permit.ExistingOccupancy = parseInt(allPermits[i][60]);
	permit.ProposedOccupancy = parseInt(allPermits[i][61]);
	permit.SiteFill = allPermits[i][62];
	permit.Zoning = {};
	permit.Zoning.Dist1 = allPermits[i][63];
	permit.Zoning.Dist2 = allPermits[i][64];
	permit.Zoning.Dist3 = allPermits[i][65];
	permit.Zoning.SDistrict1 = allPermits[i][66];
	permit.Zoning.SDistrict2 = allPermits[i][67];
	permit.Owner = {};
	permit.Owner.Type = allPermits[i][68];
	permit.Owner.NonProfit = allPermits[i][69];
	permit.Owner.Name = allPermits[i][70];
	permit.Owner.BusinessName = allPermits[i][71];
	permit.Owner.HouseStreet = allPermits[i][72];
	permit.Owner.CityStateZip = allPermits[i][73];
	permit.Owner.Phone = allPermits[i][74];
	permit.JobDescription = allPermits[i][75];
	permit.bbl = bbl(allPermits[i][2], allPermits[i][5], allPermits[i][6]);
	
	return permit;
}


//input: [[]], 'name of collection'
//output: writes documents to mongoDB
function mongoInsert(thePermits, nameOfCollection, done) {
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
	  		typeof done === 'function' && done();
	  	}
	})
}

//parses date
//input: string, example: 6/17/2014 OR 10/1/2014 month/day/year
//output: date in date format 
//Date(year, month, day)
function dateParser(date) {


	if (typeof date === 'undefined') {
		return 'no date';
	}
	else if (date === 0 || date === '0') {
		return 0;
	} else {
		var date_array = date.split('/');
		
		//console logs when date doesn't start to a number to catch errors in the data
		if (/[a-z]/.test(date)) {
			console.log('error in the date field:');
		}

		var year = date_array[2];
		var month = parseInt(date_array[0], 10) - 1;
		var day = date_array[1];
		return new Date(year, month, day);
	}	
}

//input: string
//output: string
function removesMoneySign(money) {
	if (typeof money != 'undefined') {
		return money.replace('$', '');
	} else {
		console.log('a field is undefined');
		return 'undefined';
	}
}



module.exports = {
	fileLines: fileLines,
	removeTopThreeRows: removeTopThreeRows,
	splitRow: splitRow,
	splitRows: splitRows,
	permitConstructor: permitConstructor,
	mongoInsert: mongoInsert,
	removeWhiteSpace: removeWhiteSpace,
	bbl: bbl,
	dateParser: dateParser, 
	removesMoneySign: removesMoneySign
}



