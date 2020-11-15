var moment = require('moment');
var async = require('async');

var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['stat']);

var confApi = require('../configure/module.api');
var maApi = require('../matask/module.api');

var post_getDailyStat_MA = function (req, res) {
    var params = JSON.parse(req.body.data);
    db.stat.find({ 'level1': 'matask', 'level2': params.level2 }, function (err, result) {
        var ret = { "success": true, "data": result };
        res.json(ret);
    });
}

var post_getDailyStat_MAbyPrv = function (req, res) {
    var params = parseInt(JSON.parse(req.body.data));
    maApi.fbb_getCountMAPerPrv(params, function (result) {
        var ret = { "success": true, "data": result };
        res.json(ret);
    })
}


var post_getJSONperMonth = function (req, res) {
    var params = JSON.parse(req.body.data);
    maApi.fbb_getMaTaskbyMonth(params.start, params.end, function (result) {
        async.eachSeries(result,
            function (row, done) {
                maApi.fbb_getMaTeamW8ID(row.teamid, function (resultTeam) {
                    row.prvid = resultTeam.provinceid;
                    row.teamname = resultTeam.name;
                    (row.typeid == 0) ? row.typeid = 'preventive' : row.typeid = 'corrective';
                    row.timestamp = moment(row.timestamp).format('DD/MM/YYYY HH:mm:ss');
                    confApi.fbb_mapProvince(resultTeam.provinceid, function (resultPrv) {
                        row.prvcode = resultPrv[0].code;
                        done();
                    });
                });
            },
            function (err) {
                res.json({ 'success': true, 'data': result, 'error': err });
            }
        );
    });
}

var post_getJSONperRange = function (req, res) {
    var params = JSON.parse(req.body.data);
    maApi.fbb_getMaTaskbyRange(params.start, params.end, function (result) {
        async.eachSeries(result,
            function (row, done) {
                maApi.fbb_getMaTeamW8ID(row.teamid, function (resultTeam) {
                    row.provinceid = resultTeam.provinceid;
                    row.teamname = resultTeam.name;
                    row.timestamp = moment(row.timestamp).format('DD/MM/YYYY HH:mm:ss');
                    row.timetodo = moment(row.timetodo).format('DD/MM/YYYY HH:mm:ss');

                    confApi.fbb_mapProvince(resultTeam.provinceid, function (resultPrv) {
                        row.prvcode = resultPrv[0].code;
                        confApi.fbb_mapZone(resultTeam.zoneid, function (resultZne) {
                            row.zonename = resultZne[0].detail;
                            maApi.fbb_getJobMabyID(row.jobtypeid, function(resultJob) {
                                row.jobname = resultJob.name;
                                done();
                            })
                        });
                    });
                });
            },
            function (err) {
                res.json({ 'success': true, 'data': result, 'error': err });
            }
        );
    });
}

module.exports = {
    post_getDailyStat_MA,
    post_getDailyStat_MAbyPrv,
    post_getJSONperMonth,
    post_getJSONperRange
}
