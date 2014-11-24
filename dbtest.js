var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var parser = require('./parse');

// parser.fileLines('reallysimple.csv', function(lines){
// 	var allTheLines = parser.splitRows(lines);
// 	parser.mongoInsert(allTheLines, 'testing1');

// })



parser.fileLines('sample.csv', function(lines) {
    var allTheLines = parser.splitRows(lines);
    var removedtop3 = parser.removeTopThreeRows(allTheLines);
    var permits = parser.removeWhiteSpace(removedtop3);
    console.log(parser.permitConstructor(1, permits));
})