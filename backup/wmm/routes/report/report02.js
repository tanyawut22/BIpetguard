var moment = require('moment');
var async = require('async');

var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['stat']);

var post_getDailyTerminate = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.stat.find({ 'level1': 'terminate', 'level2': params.level2 }, function (err, result) {
        var ret = { "success": true, "data": result };
        res.json(ret);
    });
}

var post_getDailyNotTerminate = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.stat.find({ 'level1': "notterminate", 'level2': params.level2 }, function (err, result) {
        db.stat.find({
            'level1': 'logTxtNotTer', 'level2': { $regex: params.level2 }
        }, function (errTxt, resultTxt) {
            if (typeof errTxt !== 'undefined' && errTxt || resultTxt == null) {
                res.json({ "success": false, "data": result, 'text': null });
            } else {
                res.json({ "success": true, "data": result, 'text': resultTxt });
            }
        })

    });
}

module.exports = {
    post_getDailyTerminate,
    post_getDailyNotTerminate
}
