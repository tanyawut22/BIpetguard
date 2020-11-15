var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['mateam', 'matasks']);

var api = require('../configure/module.api');
var maapi = require('../matask/module.api');
var reportapi = require('../report/module.api');

var moment = require('moment');
var mmtz = require('moment-timezone');
var async = require('async');
var lineApi = require('line-api');

// ================ LINE token ================
const mynoti = new lineApi.Notify({
    token: '2quB4Dm2CMjvyB7umD9IODn3ESCI8TVgDBoEuK1y3md'
});
const notifyDD = new lineApi.Notify({
    token: 'HLNs0RIUqPu7guzvPO1cqkaTpY7KCSAJgByCGuohger'
});
const notifyNQM = new lineApi.Notify({
    token: 'yUqYxbEnAr3BN4dgun9oU1DOV5WwGqlIhuQhaDbDCca'
});
const notifyNOKIA = new lineApi.Notify({
    token: 'jzcIvyRzxryVjGL9F2wQGH8bN6NAV0RmB5hgr5zUecX'
});
const notifyAFP = [
    new lineApi.Notify({ token: 'WVGCNxLq32zCGqZr8O8cCzYH3WEBlxdawmu5FFMzEuV' }), // MA OS AFP Hi-Speed CMI
    new lineApi.Notify({ token: 'J8sDDq5SlFvkCb2zJqk6CXPj1s5RQBM2l6uh8ZzXS8K' }), // MA OS AFP Permchanchai CRI
    new lineApi.Notify({ token: 'SVLEBNJ6re0vAH6xAGDFjBs1AQ3YefOZCfgJoPmpzmd' }), // MA OS AFP TIP CMI
    new lineApi.Notify({ token: 'PfweDHYhY9JtE2XEQ4FlCfs2azp4uN5F5NefWIUSWSR' }) // MA OS AFP SiangThip
];
// ============================================

var post_getProv = function (req, res) {
    api.fbb_getProvince(function (data) {
        res.json(data);
    });
}

var post_getMAPlan = function (req, res) {
    var params = JSON.parse(req.body.data);
    var compare = { $gte: params.start, $lt: params.end };
    db.matasks.find({ "timetodo": compare }).sort({ "timestamp": 1 }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            async.eachSeries(result,
                function (row, done) {
                    maapi.fbb_getJobMabyID(row.jobtypeid, function (c) {
                        row.color = c.color;
                        row.icon = c.icon;
                        done();
                    });
                },
                function (err) {
                    var ret = { "success": true, "data": result };
                    res.json(ret);
                }
            );
        }
    })
}

var post_getTeamMA = function (req, res) {
    var params = JSON.parse(req.body.data);
    var objsearch = {};
    if (params.zoneid != "0") objsearch.zoneid = mongojs.ObjectId(params.zoneid);
    if (params.provinceid != "0") objsearch.provinceid = mongojs.ObjectId(params.provinceid);
    if (params.copid != -1) objsearch.copid = params.copid;
    objsearch.type = { $in: params.type };

    db.mateam.find(objsearch).sort({ provinceid: 1, type: 1, zoneid: 1, name: 1 }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": '' };
            res.json(ret);
        } else {
            async.eachSeries(result,
                function (row, done) {
                    maapi.fbb_countWorkLoadInMonthv2(params.start, params.end, row._id, function (c) {
                        row.wlcount = c;
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

var post_getZone = function (req, res) {
    var params = JSON.parse(req.body.data);
    if (params == "0" || params == null) {
        var objs = {};
    } else {
        var objs = { "provid": mongojs.ObjectId(params) };
    }
    api.fbb_getZone(objs, function (data) {
        res.json(data)
    });
}

var post_getTypeJob = function (req, res) {
    maapi.fbb_getTypeMA(function (data) {
        var ret = { "success": true, "data": data };
        res.json(ret);
    });
}


var post_addTask = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matasks.insert(params.data, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": 'fail to add task' };
            res.json(ret);
        } else {
            maapi.fbb_getJobMabyID(result.jobtypeid, function (restype) {
                // reportapi.fbb_logStatMA('matask', params.data.teamid, params.data.timestamp, 1, function (resapi) { });
                // reportapi.fbb_logStatPerPrv('mataskprv', params.data.teamid, 1, function (resapi) { });
                var txtsend = "== มอบหมายงาน ==\n";
                txtsend += "TT : " + result.reftask + "\n";
                txtsend += "non : " + result.refnon + "\n";
                txtsend += "ประเภทงาน : " + restype.name + "\n";
                txtsend += "วันที่ : " + mmtz(result.timetodo).tz("Asia/Bangkok").format("DD-MM-YYYY") + "\n";
                txtsend += "เวลา : " + slotTxt[result.slot] + "\n";
                txtsend += "ของทีมช่าง : " + result.teamname + "\n";
                txtsend += "note : " + result.refnote + "\n";
                txtsend += "==============";

                sendMsgLINE(params.data.teamid, txtsend, 1);
                var ret = { "success": true, "data": result };
                res.json(ret);
            });
        }
    });
}

var post_loadDetail = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matasks.findOne({ "_id": mongojs.ObjectId(params) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            var ret = { "success": false, "data": 'fail to load task' };
            res.json(ret);
        } else {
            var ret = { "success": true, "data": result };
            res.json(ret);
        }
    })
}

var post_uptTask = function (req, res) {
    var params = JSON.parse(req.body.data);

    db.matasks.update(
        { "_id": mongojs.ObjectId(params._id) },
        { $set: params.dataupt },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                var ret = { "success": false, "data": result, "error": err };
                res.json(ret);
            } else {
                maapi.fbb_getJobMabyID(params.dataupt.jobtypeid, function (job) {
                    var txtupt = '== เปลี่ยนแปลงงาน ==\n';
                    txtupt += "TT : " + params.dataupt.reftask + "\n";
                    txtupt += "non : " + params.dataupt.refnon + "\n";
                    txtupt += "ประเภทงาน : " + job.name + "\n";
                    txtupt += "- จากวันที่ : " + mmtz(params.oldData.timetodo).tz("Asia/Bangkok").format("DD-MM-YYYY") + "\n";
                    txtupt += "เวลา : " + slotTxt[params.oldData.slot] + "\n";
                    txtupt += "+ เป็นวันที่ : " + mmtz(params.dataupt.timetodo).tz("Asia/Bangkok").format("DD-MM-YYYY") + "\n";
                    txtupt += "เวลา : " + slotTxt[params.dataupt.slot] + "\n";
                    txtupt += "ของทีมช่าง : " + params.oldData.teamname + "\n";
                    txtupt += "note : " + params.dataupt.refnote + "\n";
                    txtupt += "==============";

                    sendMsgLINE(params.oldData.teamid, txtupt, 1);
                    var ret = { "success": true, "data": result };
                    res.json(ret);
                });
            }
        }
    );
}

var slotTxt = ["09:00 - 12:00 น.", "12:30 - 15:30 น.", "16:00 - 19:00 น."];
var post_delTask = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matasks.find({ "_id": mongojs.ObjectId(params._id) }, function (errf, resultf) {
        if (typeof errf !== 'undefined' && errf || resultf == null) {
            res.json({ "success": false, "data": resultf[0], "txt": "fail to query old data" });
        } else {
            maapi.fbb_getJobMabyID(resultf[0].jobtypeid, function (restype) {
                var txtrej = "== ยกเลิกงาน ==\n";
                txtrej += "TT : " + resultf[0].reftask + "\n";
                txtrej += "non : " + resultf[0].refnon + "\n";
                txtrej += "ประเภทงาน : " + restype.name + "\n";
                txtrej += "ของทีมช่าง : " + resultf[0].teamname + "\n";
                txtrej += "==============";

                db.matasks.remove({ "_id": mongojs.ObjectId(params._id) }, function (errRmv, resultRmv) {
                    if (typeof errRmv !== 'undefined' && errRmv || resultRmv == null) {
                        res.json({ "success": false, "txt": "fail to update multiple bool slot" });
                    } else {
                        // reportapi.fbb_logStatMA('matask', resultf[0].teamid, resultf[0].timestamp, -1, function (resapi) { });
                        // reportapi.fbb_logStatPerPrv('mataskprv', resultf[0].teamid, -1, function (resapi) { });
                        sendMsgLINE(resultf[0].teamid, txtrej, 1);
                        res.json({ "success": true, "data": resultf[0], "txt": "success remove task" });
                    }
                });
            });
        }
    });
}

var sendMsgLINE = async function (teamId, inTxt, flag) {
    if (flag) {
        db.mateam.find({ '_id': mongojs.ObjectId(teamId) }, function (err, result) {
            if (result[0].copid == 0) {
                notifyNQM.send({ message: '\n' + inTxt });
            } else if (result[0].copid == 1) {
                notifyDD.send({ message: '\n' + inTxt });
            } else if (result[0].copid == 2) {
                notifyNOKIA.send({ message: '\n' + inTxt });
            } else if (result[0].copid == 3) { // AFP , TODO :: still static data ***
                // console.log("compare this id  :  " + teamId + " type of data : " + typeof teamId);
                db.mateam.find({ 'name': { $regex: ' - DD' } }, function (errDD, resDD) {
                    var ddIds = resDD.filter(function (DD) {
                        return DD._id == teamId;
                    });

                    if (ddIds.length != 0)
                        notifyDD.send({ message: '\n' + inTxt });
                    // mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
                });

                db.mateam.find({ 'name': { $regex: ' - HS' } }, function (errHS, resHS) {
                    var hsIds = resHS.filter(function (HS) {
                        return HS._id == teamId;
                    });

                    if (hsIds.length != 0)
                        notifyAFP[0].send({ message: '\n' + inTxt });
                    // mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
                });

                db.mateam.find({ 'name': { $regex: ' - PCC' } }, function (errPCC, resPCC) {
                    var idS = resPCC.filter(function (r) {
                        return r._id == teamId;
                    });

                    if (idS.length != 0)
                        notifyAFP[1].send({ message: '\n' + inTxt });
                    // mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
                });

                db.mateam.find({ 'name': { $regex: ' - TIP' } }, function (errTIP, resTIP) {
                    var idS = resTIP.filter(function (r) {
                        return r._id == teamId;
                    });

                    if (idS.length != 0)
                        notifyAFP[2].send({ message: '\n' + inTxt });
                    // mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
                });

                db.mateam.find({ 'name': { $regex: ' - ST' } }, function (errST, resST) {
                    var idS = resST.filter(function (r) {
                        return r._id == teamId;
                    });

                    if (idS.length != 0)
                        notifyAFP[3].send({ message: '\n' + inTxt });
                    // mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
                });
            }
        });
    } else {
        mynoti.send({ message: '\n' + inTxt + '\nfrom teamid : ' + teamId });
    }
}


var post_search = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.matasks.findOne({
        $or: [
            { "reftask": { $regex: params.kw, $options: 'i' } },
            { "refnon": { $regex: params.kw, $options: 'i' } },
            { "refnote": { $regex: params.kw, $options: 'i' } }
        ]
    }, function (err, result) {
        async.eachSeries([result],
            function (row, done) {
                if (row.teamid == null) {
                    done();
                } else {
                    maapi.fbb_getMaTeamW8ID(row.teamid, function (resultTeam) {
                        row.copid = resultTeam.copid;
                        row.prvid = resultTeam.provinceid
                        done();
                    });
                }
            },
            function (err) {
                var ret = { "success": true, "data": result };
                res.json(ret);
            }
        );
    });
}

module.exports = {
    post_addTask,
    post_getMAPlan,
    post_getProv,
    post_getTeamMA,
    post_getTypeJob,
    post_getZone,
    post_loadDetail,
    post_delTask,
    post_uptTask,
    post_search,
}
