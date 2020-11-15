var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['matask_plan', 'mateam']);

var api = require('../configure/module.api');
var maapi = require('../matask/module.api');
var reportapi = require('../report/module.api');

var moment = require('moment');
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

var post_getMAPlan = function (req, res) {
	var params = JSON.parse(req.body.data);
	var compare = { $gte: params.start, $lt: params.end };
	db.mataskplan.find({ "timestamp": compare }, function (err, result) {
		if (typeof err !== 'undefined' && err || result == null) {
			var ret = { "success": false, "data": '' };
			res.json(ret);
		} else {
			ret = { "success": true, "data": result };
			res.json(ret);
		}
	})
}

var post_getTeamMA = function (req, res) {
	var params = JSON.parse(req.body.data);
	var objsearch = {};
	if (params.zoneid != "0") objsearch.zoneid = mongojs.ObjectId(params.zoneid);
	if (params.provinceid != "0") objsearch.provinceid = mongojs.ObjectId(params.provinceid);
	if (params.copid != -1) objsearch.copid = params.copid;

	db.mateam.find(objsearch).sort({ "provinceid": 1, type: 1, "name": 1 }, function (err, result) {
		if (typeof err !== 'undefined' && err || result == null) {
			var ret = { "success": false, "data": '' };
			res.json(ret);
		} else {

			async.eachSeries(result,
				function (row, done) {
					maapi.fbb_countWorkLoadInMonth(params.start, params.end, row._id, function (c) {
						row.wlcount = c;
						// api.fbb_mapProvince(row.provinceid, function (dP) {
						// api.fbb_mapZone(row.zoneid, function (dZ) {
						// row.objP = dP;
						// row.objZ = dZ;
						done();
						// });
						// });
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

var post_addTask = function (req, res) {
	var params = JSON.parse(req.body.data);
	if (params.data.slot != null) {
		db.mataskplan.find({
			"timestamp": { $gte: params.compare.st, $lt: params.compare.ed },
			"slot": params.data.slot,
			"teamid": params.data.teamid
		}).count(function (errfound, resfound) {
			// console.log(resfound);
			if (resfound == 0) {
				db.mataskplan.insert(params.data, function (err, result) {
					if (typeof err !== 'undefined' && err || result == null) {
						var ret = { "success": false, "data": 'fail to add task' };
						res.json(ret);
					} else {
						reportapi.fbb_logStatMA('matask', params.data.teamid, params.data.timestamp, 1, function (resapi) { });
						reportapi.fbb_logStatPerPrv('mataskprv', params.data.teamid, 1, function (resapi) { });
						sendMsgLINE(params.data.teamid, params.data.note);
						var ret = { "success": true, "data": result };
						res.json(ret);
					}
				});
			} else {
				var ret = { "success": false, "data": 'assign duplicate slot' };
				res.json(ret);
			}
		});
	} else {
		db.mataskplan.find({
			"timestamp": { $gte: params.compare.st, $lt: params.compare.ed },
			"slot": null,
			"teamid": params.data.teamid
		}).count(function (errfoundBatch, resfoundBatch) {
			if (resfoundBatch == 0) {
				db.mataskplan.insert(params.data, function (errBatch, resultBatch) {
					if (typeof errBatch !== 'undefined' && errBatch || resultBatch == null) {
						res.json({ "success": false, "data": 'fail to add task' });
					} else {
						reportapi.fbb_logStatMA('matask', params.data.teamid, params.data.timestamp, 3, function (resapi1) { });
						reportapi.fbb_logStatPerPrv('mataskprv', params.data.teamid, 3, function (resapi2) { });
						sendMsgLINE(params.data.teamid, "== เพิ่มงานเหมาทุก slot ==\n" + params.data.note);
						res.json({ "success": true, "data": resultBatch });
					}
				});
			} else {
				res.json({ "success": false, "data": 'assign duplicate slot' });
			}
		});



	}
}

var post_loadDetail = function (req, res) {
	var params = JSON.parse(req.body.data);
	db.mataskplan.findOne({ "_id": mongojs.ObjectId(params) }, function (err, result) {
		if (typeof err !== 'undefined' && err || result == null) {
			var ret = { "success": false, "data": 'fail to load task' };
			res.json(ret);
		} else {
			var ret = { "success": true, "data": result };
			res.json(ret);
		}
	})
}

var post_delTask = function (req, res) {
	var params = JSON.parse(req.body.data);
	db.mataskplan.find({ "_id": mongojs.ObjectId(params._id) }, function (errf, resultf) {
		db.mataskplan.remove({ "_id": mongojs.ObjectId(params._id) }, function (err, result) {
			if (typeof err !== 'undefined' && err || result == null) {
				var ret = { "success": false, "data": 'fail to remove task' };
				res.json(ret);
			} else {
				if (resultf[0].multi) {
					reportapi.fbb_logStatMA('matask', resultf[0].teamid, resultf[0].timestamp, -3, function (resapi) { });
					reportapi.fbb_logStatPerPrv('mataskprv', resultf[0].teamid, -3, function (resapi) { });
					var txtrej = '== ยกเลิกงานเหมาทุก slot ==\n' + resultf[0].note.match(/(.*)\n/g)[0];
					sendMsgLINE(resultf[0].teamid, txtrej);
					res.json({ "success": true, "data": resultf[0] });
				} else {
					reportapi.fbb_logStatMA('matask', resultf[0].teamid, resultf[0].timestamp, -1, function (resapi) { });
					reportapi.fbb_logStatPerPrv('mataskprv', resultf[0].teamid, -1, function (resapi) { });
					var txtrej = '== ยกเลิกงาน ==\n' + resultf[0].note.match(/(.*)\n/g)[0];
					sendMsgLINE(resultf[0].teamid, txtrej);
					res.json({ "success": true, "data": resultf[0] });
				}
			}
		});
	});
}

var post_delTaskNew = function (req, res) {
	var slotTxt = ["09:00 - 12:00 น.", "12:30 - 15:30 น.", "16:00 - 19:00 น."];
	var params = JSON.parse(req.body.data);
	db.mataskplan.find({ "_id": mongojs.ObjectId(params._id) }, function (errf, resultf) {
		if (typeof errf !== 'undefined' && errf || resultf == null) {
			res.json({ "success": false, "data": resultf[0], "txt": "success set flag to FALSE" });
		} else {
			resultf[0].boolSlot[params.indx] = false;

			if (!resultf[0].boolSlot.some(isContainT)) { // ถ้าเป็น job slot เดียว จะเข้าทันที แต่ multi ต้องให้ครบทุกช่องก่อน
				db.mataskplan.remove({ "_id": mongojs.ObjectId(params._id) }, function (err, result) {
					if (typeof err !== 'undefined' && err || result == null) {
						var ret = { "success": false, "data": 'fail to remove task' };
						res.json(ret);
					} else {
						reportapi.fbb_logStatMA('matask', resultf[0].teamid, resultf[0].timestamp, -1, function (resapi) { });
						reportapi.fbb_logStatPerPrv('mataskprv', resultf[0].teamid, -1, function (resapi) { });
						var txtrej = '== ยกเลิกงาน ==\n' + resultf[0].note.match(/(.*)\n/g)[0];
						sendMsgLINE(resultf[0].teamid, txtrej);
						res.json({ "success": true, "data": resultf[0] });
					}
				});
			} else {
				var txtrej = "== ยกเลิกงาน ==\n" + resultf[0].note.match(/(.*)\n/g)[0];
				txtrej += "\nslot " + (params.indx + 1) + " : " + slotTxt[parseInt(params.indx)] + "\n";
				db.mataskplan.update(
					{ "_id": mongojs.ObjectId(params._id) },
					{ $set: { 'boolSlot': resultf[0].boolSlot, 'note': resultf[0].note + "\nยกเลิก slot " + (params.indx + 1) + " : " + slotTxt[parseInt(params.indx)] + "\n" } },
					function (errUpt, resultUpt) {
					if (typeof errUpt !== 'undefined' && errUpt || resultUpt == null) {
						res.json({ "success": false, "txt": "fail to update multiple bool slot" });
					} else {
						reportapi.fbb_logStatMA('matask', resultf[0].teamid, resultf[0].timestamp, -1, function (resapi) { });
						reportapi.fbb_logStatPerPrv('mataskprv', resultf[0].teamid, -1, function (resapi) { });

						sendMsgLINE(resultf[0].teamid, txtrej);
						res.json({ "success": true, "data": resultf[0], "txt": "success set flag to FALSE" });
					}
				});
			}
		}
	});
}

var post_uptTaskMA = function (req, res) {
	var params = JSON.parse(req.body.data);
	// console.log("========== params ==========");
	// console.log(params.data.boolSlot);
	// console.log(params.compare.isPad);
	// console.log(params.isBatch);
	// console.log("============================\n");
	db.mataskplan.find({ _id: mongojs.ObjectId(params.maid) }, function (errOld, resultOld) {
		var data2comapare = {
			$and: [
				{ timestamp: { $gte: params.compare.st, $lt: params.compare.ed } },
				{ teamid: resultOld[0].teamid },
				{ $or: [] }
			]
		};
		for (let j = 0; j < 3; j++) {
			var objk = {};
			var key = "boolSlot" + "." + j;
			objk[key] = true;
			if (!resultOld[0].multi) {
				if (params.data.boolSlot[j] || params.data.boolSlot[j] == 1) {
					data2comapare["$and"][2]["$or"].push(objk);
					objk[key] = true;
					data2comapare["$and"][2]["$or"].push(objk);
				}
			} else {
				if (resultOld[0].boolSlot[j] || resultOld[0].boolSlot[j] == 1) {
					data2comapare["$and"][2]["$or"].push(objk);
					objk[key] = true;
					data2comapare["$and"][2]["$or"].push(objk);
				}
			}
		}
		// console.log(data2comapare);
		// console.log("============================");
		// console.log(data2comapare["$and"][0].timestamp);
		// console.log(data2comapare["$and"][2]["$or"]);
		// console.log("============================");
		db.mataskplan.find(data2comapare).count(function (errfound, resfound) {
			var flag = false;
			var reason = '';
			// console.log(resfound);
			if (params.compare.isPad) {
				if (resfound == 0) {
					// console.log('1'); // อัพเดทโลด
					flag = true;
					reason = "ไม่พบงานใด ๆ ใน slot ที่เลือก  ในวันถัดไปหรือวันก่อน ๆ";
				} else {
					// console.log('2'); // ข้ามหรือย้อนวันแล้วชน
					flag = false;
					reason = "พบงานใน slot ที่เลือก  ในวันถัดไปหรือวันก่อน ๆ";
				}
			} else {
				if (resfound == 0) {
					// console.log('3'); // can update same day
					flag = true;
					reason = "ไม่พบงานใน slot ที่เลือก ในวันเดียวกัน";
				} else {
					// console.log('4'); // update in same slot same day but add how to check if exist job
					// console.log(resultOld[0].reftext + '  :  ' + params.data.reftext);
					if (resultOld[0].reftext == params.data.reftext) {
						flag = true;
						reason = "อัพเดท slot เดิม  เลข reftext ตรงกับของเดิม";
					} else {
						flag = false;
						reason = "อัพเดท slot เดิม  แต่เลข reftext ไม่ตรงกับของเดิม"
					}
				}
			}
			// console.log(reason);

			if (flag) {
				db.mataskplan.update({ '_id': mongojs.ObjectId(params.maid) }, { $set: params.data }, function (err, result) {
					if (typeof err !== 'undefined' && err || result == null) {
						var ret = { "success": false, "data": '', "isdup": false, "msg": reason };
						res.json(ret);
					} else {
						var txtSend = '== เปลี่ยนแปลงงาน ==\n' + params.data.note;
						sendMsgLINE(resultOld[0].teamid, txtSend);
						var ret = { "success": true, "data": result, "isdup": false, "msg": reason };
						res.json(ret);
					}
				});
			} else {
				var ret = { "success": false, "data": 'can\'t update to this slot', "isdup": true, "msg": reason };
				res.json(ret);
			}
		});
	});
}

var post_search = function (req, res) {
	var params = JSON.parse(req.body.data);
	db.mataskplan.findOne({
		$or: [
			{ "reftxt": { $regex: params.kw, $options: 'i' } },
			{ "note": { $regex: params.kw, $options: 'i' } }
		]
	}, function (err, result) {
		// console.log(result);
		db.mateam.findOne({ "_id": mongojs.ObjectId(result.teamid) }, function (err1, result1) {
			var ret = { "success": true, "data": result, "datateam": result1 };
			res.json(ret);
		});
	});
}

var sendMsgLINE = async function (teamId, inTxt) {
	var flag = 1;
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
		mynoti.send({ message: '\n' + inTxt + 'from teamid : ' + teamId });
	}
}

var isContainT = function (element) {
	return element;
};

module.exports = {
	post_addTask,
	post_delTask,
	post_delTaskNew,
	post_getMAPlan,
	post_getTeamMA,
	post_getZone,
	post_loadDetail,
	post_search,
	post_uptTaskMA
}