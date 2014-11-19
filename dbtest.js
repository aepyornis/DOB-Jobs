var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var parser = require('./parse');

//This function works
// function mongoInsert(documentToBeInserted){
// 	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
// 		if(err) throw err;
// 		db.collection('testing1').insert(documentToBeInserted, function(err, docs){
// 				db.close();
// 			}
// 		);
// 	})
// }


parser.fileLines('reallysimple.csv', function(lines){
	var allTheLines = parser.splitRows(lines);
	parser.mongoInsert(allTheLines);

})


