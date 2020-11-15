var moment = require('moment');
var async = require('async');

var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['mateam']);

var post_getProv = function (req, res) {
    api.fbb_getProvince(function (data) {
        res.json(data);
    });
}

var post_getTeamByProv = function (req, res) {
    var params = JSON.parse(req.body.data);
    console.log(params);
    if (params != "0" && params != null) {
        var s = { "provinceid": mongojs.ObjectId(params) };
    } else {
        var s = {};
    }
    db.mateam.find(s, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            var ret = { "success": true, "data": result };
            res.json(ret);
        }
    });
}

module.exports = {
    post_getProv,
    post_getTeamByProv
}