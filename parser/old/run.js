var fs = require('fs');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var async = require('async');
var parser = require('./parse');

var list_of_paths = ['D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0114.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0214.csv', 'D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0314.csv', 'D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0414.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0514.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0614.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0714.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0814.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job0914.csv','D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job1014.csv'];
list_of_paths.push('D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job110814week.csv');
list_of_paths.push('D:\\code\\DOB data\\2014 DOB Jobs\\csv\\job111514week.csv');

main(list_of_paths[0], 'jobs2014', function(){
    main(list_of_paths[1], 'jobs2014', function(){
        main(list_of_paths[2], 'jobs2014', function(){
            main(list_of_paths[3], 'jobs2014', function(){
                main(list_of_paths[4], 'jobs2014', function(){
                    main(list_of_paths[5], 'jobs2014', function(){
                        main(list_of_paths[6], 'jobs2014', function(){
                            main(list_of_paths[7], 'jobs2014', function(){
                                main(list_of_paths[8], 'jobs2014', function(){
                                    main(list_of_paths[9], 'jobs2014', function(){
                                         main(list_of_paths[10], 'jobs2014', function(){
                                             main(list_of_paths[11], 'jobs2014', function(){
                                                console.log('DOB JOBS FOR ALL. It is done')
                                             });
                                         });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


function main(file_path, collectionName, done){
    parser.fileLines(file_path, function(result){
        var withoutTop3 = parser.removeTopThreeRows(result);
        var permits = parser.removeWhiteSpace(parser.splitRows(withoutTop3));
       parser.mongoInsert(permits, collectionName, done);
    })
}
