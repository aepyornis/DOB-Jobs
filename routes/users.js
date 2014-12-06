var express = require('express');
var router = express.Router();

/* GET most recent permits */
router.get('/mostrecent', function(req, res){
    var db = req.db;
    console.log(db);
    db.collection('jobs2014').find().limit(10).toArray(function (err, items){
        res.json(items);
    })
})



module.exports = router;

//sort({ LatestActionDate: -1 })