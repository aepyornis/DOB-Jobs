var parser = require('./parse');
var should = require('should');

describe('fileLines', function() {

	it('works on sample csv', function(done) {
		parser.fileLines('reallysimple.csv', function(lines) {
			lines.length.should.eql(3);
			done();
		});
	})

})

describe('removeTopTwoRows', function() {

	it('works on small example', function(){
		parser.removeTopTwoRows(['row1', 'row2', 'row3', 'row4']).should.eql(['row3', 'row4'])
	})
})

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

// {
// 	job: '893423423',
// 	doc: '1',
// 	borough: 'MANHATTAN',
// 	house: '59'

// }


//input [string]
//output [ [string] ]
// ['893423423,1,MANHATTAN,59', '320853536,1,BROOKLYN,2424']
// [['893423423','1','MANHATTAN','59'], ['320853536','1','BROOKLYN','2424']]


// ['893423423,1,MANHATTAN,59']
// ['893423423','1','MANHATTAN','59']
// //
// {
// 	job: '893423423',
// 	doc: '1',
// 	borough: 'MANHATTAN',
// 	house: '59'

// }
// //some strings converted to numbers
// {
// 	job: 893423423,
// 	doc: 1,
// 	borough: 'MANHATTAN',
// 	house: '59' 

// }
