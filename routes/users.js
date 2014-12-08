var express = require('express');
var router = express.Router();

/* GET most recent permits */
router.get('/mostrecent', function(req, res){
    var db = req.db;
    db.collection('jobs2014').find({ CB: '304'}).sort({ LatestActionDate: -1}).limit(25).toArray(function (err, items){
        res.json(items);
    })
})



module.exports = router;

//sort({ LatestActionDate: -1 })