var moment = require('moment');
var async = require('async');

var api = require('../configure/module.api');

var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['mateam', 'mapool', 'matask_type', 'matask_plan']);

var post_getTeamMA = function (req, res) {
    var params = JSON.parse(req.body.data);
    var objsearch = {};
    if (params.provinceid == "0" && params.copid == -1) {
        objsearch = {};
    } else if (params.provinceid == "0" && params.copid != -1) {
        objsearch = { 'copid': params.copid };
    } else if (params.provinceid != "0" && params.copid == -1) {
        objsearch = { 'provinceid': mongojs.ObjectId(params.provinceid) };
    } else if (params.provinceid != "0" && params.copid != -1) {
        objsearch = { 'provinceid': mongojs.ObjectId(params.provinceid), 'copid': params.copid };
    }
    db.mateam.find(objsearch).sort({ "provinceid": 1, "name": 1 }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            var ret = { "success": true, "data": result };
            res.json(ret);
        }
    });
}

var post_getProv = function (req, res) {
    api.fbb_getProvince(function (data) {
        res.json(data);
    });
}

var post_saveItemToPool = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.mapool.insert(params, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            db.config.update({}, { $inc: { 'num': 1 } }, function (err1, result1) {
                var ret = { "success": true, "data": result };
                res.json(ret);
            });
        }
    });
}

var post_getMAPool = function (req, res) {
    db.mapool.find({}, function (err, result) {
        async.eachSeries(result,
            function (row, done) {
                db.matask_type.findOne({ "_id": mongojs.ObjectId(row.typeid) }, function (suberr, subres) {
                    if (typeof suberr !== 'undefined' && suberr || subres == null) {
                        row.typeobj = null;
                    } else {
                        row.typeobj = subres;
                    }
                    done();
                });
            },
            function (err) {
                var ret = { "success": true, "data": result };
                res.json(ret);
            }
        );
    });
}

var post_addTasktoTeam = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_plan.insert(params.data, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": 'fail to add task' };
            res.json(ret);
        } else {
            db.mapool.remove({ "_id": mongojs.ObjectId(params.poolid) }, function (err1, result1) {
                if (typeof err1 !== 'undefined' && err1 || result1 == null) {
                    var ret = { "success": false, "data": 'fail to remove from pool' };
                    res.json(ret);
                } else {
                    var ret = { "success": true, "data": result };
                    res.json(ret);
                }
            });
        }
    });
}

var post_getPlanMA = function (req, res) {
    var params = JSON.parse(req.body.data);
    var comp = {
        $gte: params.start, $lt: params.end
    }
    db.matask_plan.find({ "timestamp": comp }, function (err, result) {
        // db.matask_plan.find({ "timestamp": { $gte: "2018-05-02T17:00:00.000Z", $lt: "2018-05-03T16:59:59.000Z" } }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            async.eachSeries(result,
                function (row, done) {
                    db.matask_type.findOne({ "_id": mongojs.ObjectId(row.typeid) }, function (err1, result1) {
                        if (typeof err1 !== 'undefined' && err1 || result1 == null) {
                        } else {
                            row.color = result1.color;
                            row.icon = result1.icon;
                        }
                        done();
                    });
                },
                function (err) {
                    var ret = { "success": true, "data": result };
                    res.json(ret);
                }
            );
        }
    });
}

var post_getDetailPlanMA = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_type.find({ '_id': mongojs.ObjectId(params.typeid) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            var ret = { "success": true, "data": result[0] };
            res.json(ret);
        }
    });
}

var post_uptDetailPlanMA = function (req, res) {
    var params = JSON.parse(req.body.data);
    if (params.data.status == "0") {
        params.data.status = "ASSIGN";
    } else if (params.data.status == "1") {
        params.data.status = "COMPLETE";
    }
    db.matask_plan.findOne({ '_id': mongojs.ObjectId(params._id) }, function (errOld, resultOld) {
        var mmObj = moment(resultOld.timestamp);
        mmObj.set({ 'year': params.data.objTime.y, 'month': params.data.objTime.m, 'date': params.data.objTime.d });
        params.data.timestamp = mmObj.toISOString();

        db.matask_plan.update({ '_id': mongojs.ObjectId(params._id) }, { $set: params.data }, function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                var ret = { "success": false, "data": '' };
                res.json(ret);
            } else {
                var ret = { "success": true, "data": result };
                res.json(ret);
            }
        });
    });
}

var post_getCode = function (req, res) {
    db.config.find({}, function (err, result) {
        var ret = { "success": true, "data": result };
        res.json(ret);
    });
}

var post_delTaskPlan = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_plan.remove({ "_id": mongojs.ObjectId(params) }, function (err, result) {
        var ret = { "success": true, "data": result };
        res.json(ret);
    });
}

var post_search = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matask_plan.findOne({
        $or: [
            { "reftxt": { $regex: params.kw, $options: 'i' } },
            { "note": { $regex: params.kw, $options: 'i' } }
        ]
    }, function (err, result) {
        db.matask_type.find({ "_id": mongojs.ObjectId(result.typeid) }, function (err1, result1) {
            result.typeobj = result1[0];
            delete result.typeid;
            var ret = { "success": true, "data": result };
            res.json(ret);
        });
    });
}

module.exports = {
    post_getTeamMA,
    post_getProv,
    post_saveItemToPool,
    post_getMAPool,
    post_addTasktoTeam,
    post_getPlanMA,
    post_uptDetailPlanMA,
    post_getDetailPlanMA,
    post_getCode,
    post_delTaskPlan,
    post_search
}