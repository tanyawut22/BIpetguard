var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['province', 'zone']);

var fbb_getProvince = function (onCompleted) {
    db.province.find({}, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            ret = { "success": false, "data": '' };
            onCompleted(ret);
        } else {
            ret = { "success": true, "data": result };
            onCompleted(ret);
        }
    });
}

var fbb_getAllZoneByPID = function (inpid, onCompleted) {
    db.zone.find({ "provid": mongojs.ObjectId(inpid) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            ret = { "success": false, "data": '' };
            onCompleted(ret);
        } else {
            ret = { "success": true, "data": result };
            onCompleted(ret);
        }
    });
}

var fbb_getZone = function (kwobj, onCompleted) {
    db.zone.find(kwobj, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            ret = { "success": false, "data": '' };
            onCompleted(ret);
        } else {
            ret = { "success": true, "data": result };
            onCompleted(ret);
        }
    });
}

var fbb_mapProvince = function (inId, onCompleted) {
    db.province.find({ "_id": mongojs.ObjectId(inId) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted(null);
        } else {
            onCompleted(result);
        }
    });
}

var fbb_mapZone = function (inId, onCompleted) {
    db.zone.find({ "_id": mongojs.ObjectId(inId) }, function (err, result) {
        if (typeof err !== 'undefined' && err || result == null) {
            onCompleted(null);
        } else {
            onCompleted(result);
        }
    });
}

var fbb_addZone = function (inName, inPID, onCompleted) {
    db.zone.insert({ "detail": inName, "provid": mongojs.ObjectId(inPID) }, function (err, result) {
        onCompleted(result);
    });
}

var fbb_deleteZone = function (inID, onCompleted) {
    db.zone.remove({ "_id": mongojs.ObjectId(inID) }, function (err, result) {
        var ret = { 'success': true, 'result': result};
        onCompleted(ret);
    });
}

var fbb_addProvince = function (inName, onCompleted) {
    db.province.insert({ "fname": inName }, function (err, result) {
        onCompleted(result);
    });
}

var fbb_deleteProvince = function (inID, onCompleted) {
    db.zone.find({ "provid": mongojs.ObjectId(inID) }).count(function (errC, resultC) {
        console.log('มีคนใช้งาน zone id นี้อยู่จำนวน : ' + resultC);
        if (parseInt(resultC) == 0) {
            db.province.remove({ "_id": mongojs.ObjectId(inID) }, function (err, result) {
                var ret = { 'success': true, 'result': result};
                onCompleted(ret);
            });
        } else {
            onCompleted({ success: false, 'result': errC });
        }
    });
}

var fbb_updateProv = function(inID, inName, onCompleted) {
  db.province.update(
    { _id: mongojs.ObjectId(inID) },
    { $set: { fname: inName } },
    function(err, result) {
      onCompleted({ success: true, result: result });
    }
  );
};

var fbb_updateZone = function(inID, inName, onCompleted) {
  db.zone.update(
    { _id: mongojs.ObjectId(inID) },
    { $set: { detail: inName } },
    function(err, result) {
      onCompleted({ success: true, result: result });
    }
  );
};


module.exports = {
    fbb_addProvince,
    fbb_addZone,
    fbb_getAllZoneByPID,
    fbb_getProvince,
    fbb_getZone,
    fbb_mapProvince,
    fbb_mapZone,
    fbb_deleteProvince,
    fbb_deleteZone,
    fbb_updateProv,
    fbb_updateZone
}