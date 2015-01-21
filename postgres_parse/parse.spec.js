var fs = require('fs');
var should = require('should');
var parser = require('./parse');
var async = require('async');
var pg = require('pg');

describe('create_excel_files_arr', function(){

    it('removes non-xls files and returns array', function(){
        var excel_array = parser.create_excel_files_arr('../data');
        excel_array.should.have.lengthOf(12);
    })

})

describe('do_some_SQL', function(){

    it('should execute some SQL', function(done){
        var client = new pg.Client('postgres://mrbuttons:mrbuttons@localhost/dob');
        parser.do_some_SQL(client, 'SELECT NOW() As "theTime"', function(result){
            result.rows.should.have.lengthOf(1)
            client.end()
            done()
        }) 
    })

})

describe('read_excel_file', function(){

    it('should be an array', function(done) {
        parser.read_excel_file('test.xls', function(records){
            records.should.be.an.Array.and.an.Object;
            done();
        })
    })
})

 // var pg = require('pg');
 //    var connectionString = "pg://brian:1234@localhost/postgres"
 //    pg.connect(connectionString, function(err, client, done) {
 //        client.query('SELECT name FROM users WHERE email = $1', ['brian@example.com'], function(err, result) {
 //          assert.equal('brianc', result.rows[0].name);
 //          done();
 //        });
 //    });


// describe('the whole damn thing', function(){
//     this.timeout(20000);

//     var excel_records;
//     var query_array;


//     it('should connect to postgres', function(done){
//         var connectionString = 'postgres://mrbuttons@localhost/dob';
//         pg.connect(connectionString, function(err, client, finished){
//             should.not.exist(err);
//             finished();
//             done();
//         })
//     })

//     it('should read excel file', function(done){
//         parser.read_excel_file('test.xls', function(records){
//             records.should.be.an.Array.and.an.Object;
//             excel_records = records;
//             done();
//         })
//     })

describe('connection', function(){

    describe('start the test', function(){

        it('should connect', function(done) {
            pg.connect('postgres://mrbuttons@localhost/dob', function(err, client, finished){
                should.not.exist(err)
                finished()
                done()
            })
        })
        
        after(function(){
            pg.end();
        })
    })                
})




    // describe('start the entire test', function(){
    //     pg.connect('postgres://mrbuttons@localhost/dob', function(err, client, finished){
    //         it('should not have a connection error', function(){
    //             should.not.exist(err);
    //         })

    //         it('should create an array of functios that executes queires', function(){
    //             query_array = parser.create_queries_array(excel_records, client);
    //             query_array.should.have.lengthOf(4);
    //         })
    //         it('should insert them into postgres', function(done){
    //             async.parallel(query_array, function(err) {
    //                 if (err) console.log(err);
    //                 should.not.exist(err);
    //                 done();
    //             })
    //         })

    //         it('postgres should have the records', function(done){

    //             var testSQL = 'SELECT * FROM dob_jobs';
    //             parser.do_some_SQL(client, testSQL, function(err, result){
    //                 should.not.exist(err);
    //                 result.rows.should.be.an.Array.and.an.Object;
    //                 result.rows.should.have.lengthOf(4);
    //                 done();
    //             })
    //         })

    //         after(function(done){
    //             finished()
    //             pg.end()
    //             done()
    //         })
    //     })
    // })
