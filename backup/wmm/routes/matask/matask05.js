var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['mateam']);

var api = require('../configure/module.api');

var moment = require('moment');
var async = require('async');

var post_getTeamWithDetail = function (req, res) {
    db.mateam.find({}).sort({ 'copid': 1, "provinceid": 1, type: 1, "name": 1 }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "staff": '' };
            res.json(ret);
        } else {
            async.eachSeries(result,
                function (row, done) {
                    api.fbb_mapProvince(row.provinceid, function (name) {
                        row.pname = name[0].fname;
                        // console.log(row.zoneid);
                        if (typeof row.zoneid != 'undefined' || row.zoneid != null) {
                            api.fbb_mapZone(row.zoneid, function (namez) {
                                // console.log(row.namez);
                                row.zname = namez[0].detail;
                                done();
                            });
                        } else {
                            row.zname = "ALL";
                            done();
                        }
                    });
                },
                function (err) {
                    var ret = { "success": true, "staff": result };
                    res.json(ret);
                }
            );

        }
    });
}

var post_getAllZoneByPID = function (req, res) {
    var inPID = JSON.parse(req.body.data);
    console.log(inPID);
    api.fbb_getAllZoneByPID(inPID, function (data) {
        res.json(data)
    });
}

var post_getProv = function (req, res) {
    api.fbb_getProvince(function (data) {
        res.json(data);
    });
}

var post_addTeam = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.mateam.insert(
        { "copid": params.copid, "name": params.name, "provinceid": mongojs.ObjectId(params.pid), "type": params.type, "zoneid": mongojs.ObjectId(params.zid) },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                var ret = { "success": false, "data": 'fail to add team' };
                res.json(ret);
            } else {
                var ret = { "success": true, "data": 'success add team', err: err, result: result };
                res.json(ret);
            }
        }
    );
};

var post_updateTeam = function (req, res) {
    var params = JSON.parse(req.body.data);
    console.log(params);
    db.mateam.update(
        { "_id": mongojs.ObjectId(params._id) },
        { $set: { 'name': params.name, 'provinceid': mongojs.ObjectId(params.pid), 'type': params.type, 'zoneid': mongojs.ObjectId(params.zid) } },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                var ret = { "success": false, "data": 'fail to update team' };
                res.json(ret);
            } else {
                var ret = { "success": true, "data": 'success update team', err: err, result: result };
                res.json(ret);
            }
        }
    );
}

var post_getZonebyID = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.zone.find({"provid": mongojs.ObjectId(params)}, function(err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": 'fail to query' };
            res.json(ret);
        } else {
            var ret = { "success": true, "data": 'success query zone frm prv', err: err, result: result };
            res.json(ret);
        }
    });
}

var post_addZone = function (req, res) {
    var params = JSON.parse(req.body.data);
    console.log(params);
    api.fbb_addZone(params.name, params.pid, function(resp) {
        var ret = { "success": true, "data": resp };
        res.json(ret);
    });
}

var post_addProv = function (req, res) {
    var params = JSON.parse(req.body.data);
    api.fbb_addProvince(params.name, function(resp) {
        var ret = { "success": true, "data": resp };
        res.json(ret);
    });
}

var post_deleteZone = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.mateam.find({ "zoneid": mongojs.ObjectId(params._id) }).count(function (errC, resultC) {
        console.log('มีคนใช้งาน zone id นี้อยู่จำนวน : ' + resultC);
        if (parseInt(resultC) == 0) {
            api.fbb_deleteZone(params._id, function (resp) {
                var ret = { "success": true, "data": resp };
                res.json(ret);
            });
        } else {
            var ret = { "success": false, "data": { error: errC, result: resultC }, "text": 'there are zone id used by mateam' };
            res.json(ret);
        }
    });
}

var post_deleteProv = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.mateam.find({ "provinceid": mongojs.ObjectId(params._id) }).count(function (errC, resultC) {
        console.log('มีคนใช้งาน province id นี้อยู่จำนวน : ' + resultC);
        if (parseInt(resultC) == 0) {
            api.fbb_deleteProvince(params._id, function (resp) {
                if (resp.success) {
                    var ret = { "success": true, "data": resp };
                } else {
                    var ret = { "success": false, "data": resp };
                }
                res.json(ret);
            });
        } else {
            var ret = { "success": false, "data": { error: errC, result: resultC }, "text": 'there are province id used by mateam' };
            res.json(ret);
        }
    });
}

var post_updateProv = function(req, res) {
    var params = JSON.parse(req.body.data);
    api.fbb_updateProv(params._id, params.name, function(resp) {
        var ret = { "success": true, "data": resp };
        res.json(ret);
    });
}

var post_updateZone = function(req, res) {
    var params = JSON.parse(req.body.data);
    api.fbb_updateZone(params._id, params.name, function(resp) {
        var ret = { "success": true, "data": resp };
        res.json(ret);
    });
}

var post_setStatus = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.mateam.update(
        { "_id": mongojs.ObjectId(params._id) },
        { $set: { "status": params.status } },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                var ret = { "success": false, error: err, result: result };
                res.json(ret);
            } else {
                var ret = { "success": true, result: result };
                res.json(ret);
            }
        }
    );
}

module.exports = {
    post_addTeam,
    post_getAllZoneByPID,
    post_getTeamWithDetail,
    post_updateTeam,
    post_getZonebyID,
    post_addZone,
    post_addProv,
    post_deleteZone,
    post_deleteProv,
    post_updateProv,
    post_updateZone,
    post_setStatus,
    post_getProv,
}
