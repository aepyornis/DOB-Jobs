var parser = require('./parse');
var should = require('should');
var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var async = require('async');

describe('parser', function(){
	var lines, withoutTop3, withSplitRow, withSplitRow, withoutWhiteSpace, bbl, testPermit
	
	describe('fileLines', function() {

		before(function(done){
			doThing(, fuction(result){
				lines = result
				done();
			})
		})

		it('separates csv into lines', function(){
			lines.length.should.eq(3);
		})

		describe('removeTopThreeRows', function() {

			before 

			it('works on small example', function(){
				parser.removeTopThreeRows(['row1', 'row2', 'row3', 'row4', 'row5']).should.eql(['row4', 'row5'])
			})

			
		})

		it('works on reallysimple.csv', function(done) {
			parser.fileLines('reallysimple.csv', function(lines) {
				lines.length.should.eql(3);
				done();
			});
		})

	})

	// describe('removeTopThreeRows', function() {

	// 	it('works on small example', function(){
	// 		parser.removeTopThreeRows(['row1', 'row2', 'row3', 'row4', 'row5']).should.eql(['row4', 'row5'])
	// 	})
	// })

	describe('splitRow', function(){
		it('works on example', function() {
			parser.splitRow('893423423,1,MANHATTAN,59').should.eql(['893423423','1','MANHATTAN','59'])
		})
	})

	describe('splitRows', function(){
		it('works on example', function(){
			parser.splitRows(['893423423,1,MANHATTAN,59', '320853536,1,BROOKLYN,2424']).should.eql([['893423423','1','MANHATTAN','59'], ['320853536','1','BROOKLYN','2424']]);
		})
	})

	describe('removeWhiteSpace', function(){
		it('works on example', function(){
			var testPermits = [['893423423','   1','MANHATTAN       ','59', '     3rd St.'], ['320853536          ','1','BROOKLYN','      2424   ', '     HENRY STREET']];
			parser.removeWhiteSpace(testPermits).should.eql([['893423423','1','MANHATTAN','59', '3rd St.'], ['320853536','1','BROOKLYN','2424', 'HENRY STREET']])
		})
	})

	describe('bbl', function(){
		it('works on simple', function(){
			parser.bbl('QUEENS', '35', '703').should.eql('4000350703');
		})

	})


	describe('permitConstructor', function() {
		var testPermit;
		before(function() {
			parser.fileLines('sample.csv', function(lines) {
			    var allTheLines = parser.splitRows(lines);
			    var removedtop3 = parser.removeTopThreeRows(allTheLines);
			    var permits = parser.removeWhiteSpace(removedtop3);
			    testPermit = parser.permitConstructor(1, permits);
			    // console.log(testPermit);
			    it('works on sample.csv', function () {
				// console.log(testPermit);
				testPermit['Borough'].should.eql('MANHATTAN');
				testPermit.Applicant.should.eql(
				{ Name: 'MICHAEL GERAZOUNIS',
			     Title: 'PE',
			     License: '66709',
			     ProfessionalCert: '' });
				testPermit.Owner.Phone.should.eql('(800) 920-4700');
			})
		});


			// var allPermits = [['893423423','1','MANHATTAN','59', '3rd St.'], ['320853536','1','BROOKLYN','2424', 'HENRY STREET']];	
			// var testPermit = parser.permitConstructor(1, allPermits);
			// testPermit.Borough.should.eql('BROOKLYN');
			// testPermit.House.should.eql('2424');
		})
	})

	describe('mongoInsert', function() {
		it('works on a test database', function(done) {
			//two test permits to be inserted
			var testPermits = [['893423423','1','MANHATTAN','59', '3rd St.'], ['320853536','1','BROOKLYN','2424', 'HENRY STREET']];
			
			//inserting into 'testingCollection', which needs to be cleared first in mongoshell
			parser.mongoInsert(testPermits, 'testingCollection', function() {
				//the callback to mongoInsert to ensure the writing is complete before doing count
				MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
					should.not.exist(err);
					db.collection('testingCollection').count(function(err, count){
						should.not.exist(err);
						count.should.eql(2);
						done();
					});
				});
			})
		})
	})





})

