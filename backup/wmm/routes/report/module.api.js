var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['stat', 'mateam']);

var moment = require('moment');

var confApi = require('../configure/module.api');
var mataskApi = require('../matask/module.api');

var groupInstall = [
    { name: 'cri', gid: 'C174bab39c536d016eba92cb9c389c0de' },
    { name: 'nsn', gid: 'Cabbf5e65253890c213db4048fb18cd18' },
    { name: 'plk', gid: 'Cbfbd8ff9cad9e10a1167d98b8ad20bc1' },
    { name: 'cmiph3', gid: 'C9f57bd9f7c9e6926f5a427db46387167' },
    { name: 'sti', gid: 'Ce240e9dd666b9fd5c2a09f28359547d1' },
    { name: 'pyo', gid: 'Ce5dd4a10879367d865c6b83dc4957fe2' },
    { name: 'utt', gid: 'C421a22c8180c6d2d35217bee621725fc' },
    { name: 'kpt', gid: 'C25df2e94a4234e3c9314642fafdac1cd' },
    { name: 'lpn', gid: 'C288f7377bf9edb47ec7659074e5ea82f' },
    { name: 'cmi', gid: 'Ccc31c5596fae157992f09ab52bb37d5e' },
    { name: 'lpg', gid: 'Cc6d283bf8afaa00f3a4bed7e42815ce6' }
];

var fbb_logStatMA = function (level1, teamid, time, meth, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    // console.log(dt.format("dddd, MMMM Do YYYY, h:mm:ss a"));
    var indxl2 = dt.format('MMYYYY');
    db.mateam.findOne({ '_id': mongojs.ObjectId(teamid) }, function (err, result) {
        db.stat.findOne({ 'level1': level1, 'level2': indxl2 }, function (errf, resf) {
            // console.log('// ======== start add data STAT (1) ======== //');
            // console.log(resf);

            var d = (dt.date() - 1);
            var z = parseInt(result.copid);

            if (resf != null && resf.val != null) {
                if (resf.val[d] == null) {
                    resf.val[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    resf.val[d][z] += meth;
                } else {
                    resf.val[d][z] += meth;
                }
                db.stat.update({ 'level1': level1, 'level2': indxl2 }, { $set: { 'val': resf.val } },
                    function (errupt, resupt) {
                        // console.log('// ******** start add data STAT (2) ******** //');
                        // console.log(resupt);
                        onCompleted(true);
                    }
                );
            } else {
                // == กรณี stat level2 ไม่มีค่าใด ๆ
                var tmp = [];
                tmp[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                tmp[d][z] += meth;
                // console.log(tmp);
                db.stat.insert({ 'level1': level1, 'level2': indxl2, 'val': tmp },
                    function (errupt, resupt) {
                        // console.log('// ******** start add data STAT (3) ******** //');
                        // console.log(resupt);
                        onCompleted(true);
                    }
                );
            }
        });
    });
}

var fbb_logStatPerPrv = function (level1, teamid, meth, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    var indxl2 = dt.format('MMYYYY');
    mataskApi.fbb_getMaTeamW8ID(teamid, function (resapi1) {
        // console.log(resapi1);
        confApi.fbb_mapProvince(resapi1.provinceid, function (resapi2) {
            // console.log(resapi2);
            db.stat.findOne({ 'level1': level1, 'level2': indxl2 }, function (errf, resf) {
                var d = (dt.date() - 1);
                var z = parseInt(resapi2[0].myidx) - 1;
                if (resf != null && resf.val != null) {
                    if (resf.val[d] == null) {
                        resf.val[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        resf.val[d][z] += meth;
                    } else {
                        resf.val[d][z] += meth;
                    }
                    db.stat.update({ 'level1': level1, 'level2': indxl2 }, { $set: { 'val': resf.val } },
                        function (errupt, resupt) {
                            onCompleted(true);
                        }
                    );
                } else {
                    var tmp = [];
                    tmp[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    tmp[d][z] += meth;
                    db.stat.insert({ 'level1': level1, 'level2': indxl2, 'val': tmp },
                        function (errupt, resupt) {
                            onCompleted(true);
                        }
                    );
                }
            });
        });
    });
}

var groupTerminate = [
    { name: 'cmi', gid: 'Cd3549d2a413a81342131cd65238fc5f4', pos: 0 },
    { name: 'cri', gid: 'C0835ddcc34a36282dc9ff49c23095b77', pos: 1 },
    { name: 'kpt', gid: 'C7c764f72e4c18f22f1b407481f114b6f', pos: 3 },
    { name: 'lpg', gid: '' },
    { name: 'lpn', gid: '' },
    { name: 'nsn', gid: 'Ca3b78b6f8ed438ce70c894d9c5b98487', pos: 4 },
    { name: 'plk', gid: 'Cac0115b5947877a554b22b4657e32822', pos: 2 },
    { name: 'pyo', gid: '' },
    { name: 'sti', gid: '' },
    { name: 'utt', gid: '' }
];

var fbb_logStatTerminate = function (level1, inLINEID, meth, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    var indxl2 = dt.format('MMYYYY');
    db.stat.findOne({ 'level1': level1, 'level2': indxl2 }, function (errf, resf) {
        var d = (dt.date() - 1);
        var res = groupTerminate.filter(function(a) {
            return a.gid === inLINEID;
        });
        if (res.length > 0) {
            if (resf != null && resf.val != null) {
                if (resf.val[d] == null) {
                    resf.val[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    resf.val[d][res[0].pos] += meth;
                } else {
                    resf.val[d][res[0].pos] += meth;
                }
                db.stat.update({ 'level1': level1, 'level2': indxl2 }, { $set: { 'val': resf.val } },
                    function (errupt, resupt) {
                        onCompleted({ success: true, data: resupt, error: errupt });
                    }
                );
            } else {
                var tmp = [];
                tmp[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                tmp[d][res[0].pos] += meth;
                db.stat.insert({ 'level1': level1, 'level2': indxl2, 'val': tmp },
                    function (errupt, resupt) {
                        onCompleted({ success: true, data: resupt, error: errupt });
                    }
                );
            }
        }
    });
}

var fbb_logSubCauseTerminate = function (level1, inLINEID, z, meth, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    var indxl2 = dt.format('MMYYYY');
    switch (inLINEID) {
        case 'Cd3549d2a413a81342131cd65238fc5f4':
            indxl2 += '_cmi';
            break;
        case 'Cac0115b5947877a554b22b4657e32822':
            indxl2 += '_cri';
            break;
        case 'C0835ddcc34a36282dc9ff49c23095b77':
            indxl2 += '_plk';
            break;
        default:
            break;
    }
    // console.log(indxl2);

    db.stat.findOne({ 'level1': level1, 'level2': indxl2 }, function (errf, resf) {
        // console.log(resf);
        var d = (dt.date() - 1);

        if (resf != null && resf.val != null) {
            if (resf.val[d] == null) {
                resf.val[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                resf.val[d][z] += meth;
            } else {
                resf.val[d][z] += meth;
            }
            db.stat.update({ 'level1': level1, 'level2': indxl2 }, { $set: { 'val': resf.val } },
                function (errupt, resupt) {
                    onCompleted({ success: true, data: resupt, error: errupt });
                }
            );
        } else {
            var tmp = [];
            tmp[d] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            tmp[d][z] += meth;
            db.stat.insert({ 'level1': level1, 'level2': indxl2, 'val': tmp },
                function (errupt, resupt) {
                    onCompleted({ success: true, data: resupt, error: errupt });
                }
            );
        }
    });
}

var fbb_logReasonNotTerminate = function (inTxt, inLINEID, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    var indxl2 = dt.format('MMYYYY');
    inTxt = inTxt.split('.')[1];

    switch (inLINEID) {
        case 'Cd3549d2a413a81342131cd65238fc5f4':
            indxl2 += '_cmi';
            break;
        case 'Cac0115b5947877a554b22b4657e32822':
            indxl2 += '_cri';
            break;
        case 'C0835ddcc34a36282dc9ff49c23095b77':
            indxl2 += '_plk';
            break;
        default:
            break;
    }
    db.stat.findOne({ 'level1': 'logTxtNotTer', 'level2': indxl2 }, function (errf, resf) {
        var d = (dt.date() - 1);

        if (resf != null && resf.val != null) {
            if (resf.val[d] == null) {
                resf.val[d] = inTxt;
            } else {
                resf.val[d] += '|' + inTxt;
            }
            db.stat.update({ 'level1': 'logTxtNotTer', 'level2': indxl2 }, { $set: { 'val': resf.val } },
                function (errupt, resupt) {
                    onCompleted({ 'success': true, 'data': resupt, 'error': errupt });
                }
            );
        } else {
            var tmp = [];
            tmp[d] = inTxt;
            db.stat.insert({ 'level1': 'logTxtNotTer', 'level2': indxl2, 'val': tmp },
                function (errupt, resupt) {
                    onCompleted({ 'success': true, 'data': resupt, 'error': errupt });
                }
            );
        }
    });
}

var fbb_logAprroveInstall = function (level1, srcObj, arrText, onCompleted) {
    var dt = moment().utcOffset("+07:00");
    var indxl2 = dt.format('MMYYYY');

    let obj = groupInstall.find(o => o.gid === srcObj.groupId);
    indxl2 += '_' + obj.name;

    var str = dt.toISOString() + '-' + arrText[1] + '-' + arrText[2];
    var tmp = { 'level1': level1, 'level2': indxl2, 'val': [str] };

    db.stat.findOne({ 'level1': level1, 'level2': indxl2 }, function (errf, resf) {
        if (resf != null && resf.val != null) {
            resf.val.push(str);
            db.stat.update({ 'level1': level1, 'level2': indxl2 }, { $set: { 'val': resf.val } }, function (err1, res1) {
                onCompleted({ 'success': true, 'data': res1, 'error': err1 });
            });
        } else {
            db.stat.insert(tmp, function (err2, res2) {
                onCompleted({ 'success': true, 'data': res2, 'error': err2 });
            });
        }
    });
}

module.exports = {
    fbb_logAprroveInstall,
    fbb_logReasonNotTerminate,
    fbb_logStatMA,
    fbb_logStatPerPrv,
    fbb_logStatTerminate,
    fbb_logSubCauseTerminate,
}