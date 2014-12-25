var parser = require('./parse');
var should = require('should');
var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var async = require('async');


describe('parser', function(){
    var lines, withoutTop3, withSplitRows, withoutWhiteSpace, bbl, testPermit;

    describe('fileLines', function(){

        before(function(done){
            parser.fileLines('sample.csv', function(result) {
                lines = result;
                // console.log(result);
                done();
            })
        })

        it('separates csv into lines', function(){
            lines.length.should.eql(6);
        })


        describe('removeTopThreeRows', function(){

            before(function(){
                withoutTop3 = parser.removeTopThreeRows(lines);
            })

            it('removes top three rows', function(){
                withoutTop3.length.should.eql(3);
            })

            describe('splitRows', function(){

                before(function(){
                    withSplitRows = parser.splitRows(withoutTop3)
                    
                })

                it('splits the rows into an array of arrays', function(){
                    withSplitRows.length.should.eql(3);
                    var oneRow = withSplitRows[1];
                    oneRow.length.should.eql(108);
                })


                describe('removeWhiteSpace', function(){
                    before(function(){
                        withoutWhiteSpace = parser.removeWhiteSpace(withSplitRows);
                    })

                    it('removes white space', function(){
                        withoutWhiteSpace.should.eql(withoutWhiteSpace_test);
                    })

                    describe('permitConstructor', function(){
                        before(function(){
                            testPermit = parser.permitConstructor(1, withoutWhiteSpace)
                        })
                        
                        it('creates permits', function(){
                            testPermit.Applicant.should.eql({ Name: 'MICHAEL GERAZOUNIS',
                                Title: 'PE',
                                License: '66709',
                                ProfessionalCert: '' });
                            testPermit.bbl.should.eql('1010967501');
                            testPermit.Owner.Phone.should.eql('(800) 920-4700');
                        }) 

                        it('removes money signs', function(){
                            testPermit.InitialCost.should.eql(0);
                        })

                

                        describe('dateParser', function(){

                            it('creates date on simple example', function(){
                                var theDate = new Date(2014, 9, 1);
                                parser.dateParser('10/1/2014').should.eql(theDate);

                            })

                            it('outputs 0 if input is 0 or "0"', function(){
                                parser.dateParser(0).should.eql(0);
                                parser.dateParser("0").should.eql(0);
                                  
                            })

                            it('works on test permit', function(){
                                var theDate = new Date(2014, 5, 17);
                                testPermit.LatestActionDate.should.eql(theDate);
                                testPermit.Approved.should.eql(0);
                            })

                            it('console logs if there\'s an letter in the date', function(){
                                parser.dateParser('11/a2/12');
                                parser.dateParser('11/22/12');
                                
                            })

                            describe('bbl', function(){
                                it('works on simple example', function(){
                                    parser.bbl('QUEENS', '35', '703').should.eql('4000350703');
                                })

                                describe('mongoInsert', function() {

                                    before(function(done){
                                        parser.mongoInsert(withoutWhiteSpace, 'testingCollection', function(){
                                            done();
                                        });
                                    })

                                    it('works on a test database', function(done) {
                                            MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
                                                should.not.exist(err);
                                                db.collection('testingCollection').count(function(err, count){
                                                    should.not.exist(err);
                                                    count.should.eql(3);
                                                    done();
                                            });
                                        });
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

describe('removesMoneySign', function(){

    it('works on example: string', function(){
        parser.removesMoneySign('$5020.53').should.eql('5020.53');
    })
    it('works on example: number', function(){
        parser.removesMoneySign(42).should.eql(42);
    })

})



//testing variables 

var withoutWhiteSpace_test = [ [ '122020142',
    '2',
    'MANHATTAN',
    '144',
    'SEVENTH AVENUE SOUTH',
    '611',
    '16',
    '1010829',
    'A1',
    'P',
    'APPROVED',
    '6/2/2014',
    'OTHER',
    '102',
    '',
    'Y',
    '',
    '',
    '',
    '',
    '',
    'Y',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'X',
    'STRUCTURAL',
    'JOSEPH BASEL',
    'PE',
    '80471',
    'Y',
    '6/2/2014',
    '6/2/2014',
    '6/2/2014',
    '0',
    '0',
    '0',
    '$0.00',
    '$0.00',
    'STANDARD',
    '0',
    '0',
    '',
    '',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'PARTNERSHIP',
    '',
    'ANDREW M CLARKE',
    'AYWANA LLC',
    '1881 BROADWAY',
    'NEW YORK NY 10023',
    '(212) 541-4477',
    'STRUCTURAL FRAMING AND ROOF DUNNAGE INSTALLATION.',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '' ],
  [ '121184501',
    '3',
    'MANHATTAN',
    '660',
    '12TH AVENUE',
    '1096',
    '7501',
    '1027125',
    'A1',
    'J',
    'P/E DISAPPROVED',
    '6/17/2014',
    'OTHER',
    '104',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Y',
    'X',
    'X',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'MICHAEL GERAZOUNIS',
    'PE',
    '66709',
    '',
    '6/2/2014',
    '6/2/2014',
    '6/2/2014',
    '6/17/2014',
    '0',
    '0',
    '$0.00',
    '$0.00',
    'STANDARD',
    '0',
    '0',
    '',
    '',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'CORPORATION',
    '',
    'JOHN IACONO',
    'BRAM AUTO GROUP',
    '7500 WESTSIDE AVENUE',
    'NORTH BERGEN NJ 07094',
    '(800) 920-4700',
    'INSTALL NEW MECHANICAL DUCTWORK ALONG WITH A/C UNIT. INSTALL NEW PLUMBING FIXTURES AND RELATED PIPING AS SHOWN ON DRAWINGS FILED HEREWITH.',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '' ],
  [ '121995494',
    '1',
    'MANHATTAN',
    '19',
    'WEST 21ST STREET',
    '823',
    '24',
    '1015530',
    'A1',
    'J',
    'P/E DISAPPROVED',
    '6/19/2014',
    'OTHER',
    '105',
    '',
    'Y',
    '',
    '',
    '',
    '',
    '',
    'Y',
    'X',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'X',
    'GEN. CONSTR.',
    'ANTHONY DIGUISEPPE',
    'RA',
    '16930',
    '',
    '6/3/2014',
    '6/3/2014',
    '6/3/2014',
    '6/4/2014',
    '0',
    '0',
    '"$150',
    '300.00"',
    '"$1',
    '823.80"',
    'STANDARD',
    '113284',
    '113284',
    '',
    '',
    '0',
    '0',
    '12',
    '12',
    '112',
    '113',
    '50',
    '50',
    'E',
    'E',
    'NOT APPLICABLE',
    'C6-4A',
    '',
    '',
    '',
    '',
    'PARTNERSHIP',
    '',
    'ASHOK MEHRA',
    'FIFTH PARTNERS LLC',
    '13 EAST 16TH STREET',
    'NEW YORK NY 10003',
    '(212) 929-5300',
    'REQUESTING TO FILE ALTERATION TYPE ONE TO ESTABLISH YOGA STUDIO USE.',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '','']];

