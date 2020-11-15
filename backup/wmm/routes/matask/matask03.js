var moment = require('moment');
var async = require('async');

var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['matask_type']);

var post_addData = function (req, res) {
    var params = JSON.parse(req.body.data);
    // parem is arr = [.., .., ..];
    db.matask_type.insert(
        { "name": params[0], "color": params[1], "icon": params[2], "type": params[3] },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                ret = { "success": false, "data": '' };
                res.json(ret);
            } else {
                ret = { "success": true, "data": result };
                res.json(ret);
            }
        }
    );
}

var post_removeData = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_type.remove(
        { "_id": mongojs.ObjectId(params) },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                ret = { "success": false, "data": '' };
                res.json(ret);
            } else {
                ret = { "success": true, "data": result };
                res.json(ret);
            }
        }
    );
}

var post_getAllData = function (req, res) {
    db.matask_type.find({},
        function (err, result) {
            ret = { "success": true, "data": result };
            res.json(ret);
        }
    );
}

var post_updateData = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_type.update({ "_id": mongojs.ObjectId(params._id) }, { $set: params.data }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            ret = { "success": true, "data": result };
            res.json(ret);
        }
    });
}

module.exports = {
    post_addData,
    post_getAllData,
    post_removeData,
    post_updateData
}