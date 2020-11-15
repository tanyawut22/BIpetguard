var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['mataskplan', 'mateam', "matasks"]);

var moment = require('moment');
var async = require('async');

var confApi = require('../configure/module.api');

var fbb_countWorkLoadInMonth = function (start, end, inStaffID, onCompleted) {
    db.mataskplan.find({ teamid: inStaffID.toString(), multi: true, timestamp: { $gte: start, $lt: end } }, function (errBatch, resultBatch) {
        if (typeof errBatch !== 'undefined' && errBatch || resultBatch == null) {
            onCompleted(0);
        } else {
            db.mataskplan.find({ teamid: inStaffID.toString(), multi: false, timestamp: { $gte: start, $lt: end } }).count(function (err, result) {
                if (typeof err !== 'undefined' && err || result == null) {
                    onCompleted(0);
                } else {
                    // result += resultBatch * 3;
                    for (let i = 0; i < resultBatch.length; i++) {
                        (resultBatch[i].boolSlot[0]) ? result++ : null;
                        (resultBatch[i].boolSlot[1]) ? result++ : null;
                        (resultBatch[i].boolSlot[2]) ? result++ : null;
                    }
                    onCompleted(result);
                }
            });
        }
    });
}

var fbb_countWorkLoadInMonthv2 = function (start, end, staffid, onCompleted) {
    db.matasks.find({ "teamid": staffid.toString(), "timetodo": { $gte: start, $lt: end } }).count(function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted(0);
        } else {
            onCompleted(result);
        }
    });
}

// income id as string
var fbb_getMaTeamW8ID = function (inId, onCompleted) {
    db.mateam.findOne({ "_id": mongojs.ObjectId(inId) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted();
        } else {
            onCompleted(result);
        }
    });
}

var fbb_getCountMAPerPrv = function (m, onCompleted) {
    var sta = moment({ 'date': 1, 'month': (m - 1), 'minute': 0, 'second': 0, 'millisecond': 000 }).toISOString();
    var end = moment({ 'date': 1, 'month': m, 'minute': m, 'second': 0, 'millisecond': 000 }).add(-1, 'millisecond').toISOString();

    db.mataskplan.aggregate({ "$match": { "timestamp": { $gte: sta, $lt: end }, "multi": false } }, { "$group": { _id: { tid: "$teamid", ctype: "$typeid" }, count: { $sum: 1 } } },
        function (err, result) {
            if (typeof err !== 'undefined' && err || result == null) {
                onCompleted(0);
            } else {
                db.mataskplan.aggregate(
                    { "$match": { "timestamp": { $gte: sta, $lt: end }, "multi": true } }, { "$group": { _id: { tid: "$teamid", ctype: "$typeid" }, count: { $sum: 3 } } },
                    function (errBatch, resultBatch) {
                        if (typeof errBatch !== 'undefined' && errBatch || resultBatch == null) { onCompleted(0); }
                        else {
                            async.eachSeries(result,
                                function (row, done) {
                                    fbb_getMaTeamW8ID(row._id.tid, function (resultTeam) {
                                        row.prvid = resultTeam.provinceid
                                        confApi.fbb_mapProvince(resultTeam.provinceid, function (resultPrv) {
                                            row.prvcode = resultPrv[0].code;
                                            done();
                                        });
                                    });
                                },
                                function (err) {
                                    async.eachSeries(resultBatch,
                                        function (subRow, subDone) {
                                            fbb_getMaTeamW8ID(subRow._id.tid, function (subResultTeam) {
                                                subRow.prvid = subResultTeam.provinceid
                                                confApi.fbb_mapProvince(subResultTeam.provinceid, function (subResultPrv) {
                                                    subRow.prvcode = subResultPrv[0].code;
                                                    subDone();
                                                });
                                            });
                                        },
                                        function (subErr) {
                                            var ret = result.concat(resultBatch);
                                            onCompleted(ret);
                                        }
                                    );
                                }
                            );
                        }
                    }
                );
            }
        }
    )
}

var fbb_getMaTaskbyMonth = function (start, end, onCompleted) {
    db.mataskplan.find({ 'timestamp': { $gte: start, $lt: end } }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) { onCompleted(0); }
        else { onCompleted(result); }
    });
}

var fbb_getMaTaskbyRange = function (start, end, onCompleted) {
    db.matasks.find({ 'timetodo': { $gte: start, $lt: end } }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) { onCompleted(0); }
        else { onCompleted(result); }
    });
}

var fbb_getTypeMA = function (onCompleted) {
    db.matask_type.find({}, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted();
        } else {
            onCompleted(result);
        }
    });
}

var fbb_getJobMabyID = function (id, onCompleted) {
    db.matask_type.find({ _id: mongojs.ObjectId(id) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted();
        } else {
            onCompleted(result[0]);
        }
    });
}

module.exports = {
    fbb_countWorkLoadInMonth,
    fbb_countWorkLoadInMonthv2,
    fbb_getCountMAPerPrv,
    fbb_getMaTaskbyMonth,
    fbb_getMaTeamW8ID,
    fbb_getTypeMA,
    fbb_getJobMabyID,
    fbb_getMaTaskbyRange,
}