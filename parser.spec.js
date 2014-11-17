var parser = require('./parse');
var should = require('should');

describe('fileLines', function() {

	it('works on sample csv', function(done) {
		parser.fileLines('reallysimple.csv', function(lines) {
			lines.length.should.equal(3);
			done();
		});
	})

})