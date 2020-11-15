
var express = require('express');
var matask01 = require('./matask01');
var matask02 = require('./matask02');
var matask03 = require('./matask03');
var matask04 = require('./matask04');
var matask05 = require('./matask05');
var matask06 = require('./matask06');

var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('matask/matask01', { title: 'matask page 1' });
});
router.post('/1.getProv', function (req, res, next) {
  matask01.post_getProv(req, res);
});
router.post('/1.getTeamByProv', function (req, res, next) {
  matask01.post_getTeamByProv(req, res);
});

// ==============================================================
//#region MATASK 02
/* router.get('/2', function (req, res, next) {
  res.render('matask/matask02', { title: 'matask page 2' });
});
router.post('/2.getTeamMA', function (req, res, next) {
  matask02.post_getTeamMA(req, res);
});
router.post('/2.getProv', function (req, res, next) {
  matask02.post_getProv(req, res);
});
router.post('/2.getTypeMA', function (req, res, next) {
  matask03.post_getAllData(req, res);
});
router.post('/2.saveItem2Pool', function (req, res, next) {
  matask02.post_saveItemToPool(req, res);
});
router.post('/2.getItemPool', function (req, res, next) {
  matask02.post_getMAPool(req, res);
});
router.post('/2.saveTaskMA', function (req, res, next) {
  matask02.post_addTasktoTeam(req, res);
});
router.post('/2.getPlanMA', function (req, res, next) {
  matask02.post_getPlanMA(req, res);
});
router.post('/2.getDetailPlanMA', function (req, res, next) {
  matask02.post_getDetailPlanMA(req, res);
});
router.post('/2.uptDetailPlanMA', function (req, res, next) {
  matask02.post_uptDetailPlanMA(req, res);
});
router.post('/2.getCode', function (req, res, next) {
  matask02.post_getCode(req, res);
});
router.post('/2.search', function (req, res, next) {
  matask02.post_search(req, res);
});
router.post('/2.delTaskPlan', function (req, res, next) {
  matask02.post_delTaskPlan(req, res);
}); */
//#endregion
// ==============================================================
//#region MATASK 03
router.get('/3', function (req, res, next) {
  res.render('matask/matask03', { title: 'matask page 3' });
});
router.post('/3.getAllData', function (req, res, next) {
  matask03.post_getAllData(req, res);
});
router.post('/3.addData', function (req, res, next) {
  matask03.post_addData(req, res);
});
router.post('/3.removeData', function (req, res, next) {
  matask03.post_removeData(req, res);
});
router.post('/3.updateData', function (req, res, next) {
  matask03.post_updateData(req, res);
});
//#endregion
// ==============================================================
//#region MATASK 04
// router.get('/4', function (req, res, next) {
//   res.render('matask/matask04', { title: 'matask page 4' });
// });
/*
router.post('/4.getMAPlan', function (req, res, next) {
  matask04.post_getMAPlan(req, res);
});
router.post('/4.getZone', function (req, res, next) {
  matask04.post_getZone(req, res);
});
router.post('/4.addTask', function (req, res, next) {
  matask04.post_addTask(req, res);
});
router.post('/4.getTeamMA', function (req, res, next) {
  matask04.post_getTeamMA(req, res);
});
router.post('/4.loadDetail', function (req, res, next) {
  matask04.post_loadDetail(req, res);
});
router.post('/4.delTask', function (req, res, next) {
  matask04.post_delTask(req, res);
});
router.post('/4.uptTaskMA', function (req, res, next) {
  matask04.post_uptTaskMA(req, res);
});
router.post('/4.search', function (req, res, next) {
  matask04.post_search(req, res);
});
router.post('/4.delTaskNew', function (req, res, next) {
  matask04.post_delTaskNew(req, res);
});
*/
//#endregion
// ==============================================================
//#region MATASK 05
router.get('/5', function (req, res, next) {
  res.render('matask/matask05', { title: 'matask page 5' });
});
router.post('/5.getTeam', function (req, res, next) {
  matask05.post_getTeamWithDetail(req, res);
});
router.post('/5.getAllZoneByPID', function (req, res, next) {
  matask05.post_getAllZoneByPID(req, res);
});
router.post('/5.addTeam', function (req, res, next) {
  matask05.post_addTeam(req, res);
});
router.post('/5.updateTeam', function (req, res, next) {
  matask05.post_updateTeam(req, res);
});
router.post('/5.getZonebyID', function (req, res, next) {
  matask05.post_getZonebyID(req, res);
});
router.post('/5.addZone', function (req, res, next) {
  matask05.post_addZone(req, res);
});
router.post('/5.addProv', function (req, res, next) {
  matask05.post_addProv(req, res);
});
router.post('/5.deleteZone', function (req, res, next) {
  matask05.post_deleteZone(req, res);
});
router.post('/5.deleteProv', function (req, res, next) {
  matask05.post_deleteProv(req, res);
});
router.post('/5.updateProv', function (req, res, next) {
  matask05.post_updateProv(req, res);
});
router.post('/5.updateZone', function (req, res, next) {
  matask05.post_updateZone(req, res);
});
router.post('/5.setStatus', function (req, res, next) {
  matask05.post_setStatus(req, res);
});
router.post('/5.getProv', function (req, res, next) {
  matask05.post_getProv(req, res);
});
//#endregion
// ==============================================================
//#region MATASK 06
router.get('/6', function (req, res, next) {
  res.render('matask/matask06', { title: 'matask page 6' });
});
router.post('/6.getProv', function (req, res, next) {
  matask06.post_getProv(req, res);
});
router.post('/6.getZone', function (req, res, next) {
  matask06.post_getZone(req, res);
});
router.post('/6.getTeamMA', function (req, res, next) {
  matask06.post_getTeamMA(req, res);
});
router.post('/6.getTypeJob', function (req, res, next) {
  matask06.post_getTypeJob(req, res);
});
router.post('/6.addTask', function (req, res, next) {
  matask06.post_addTask(req, res);
});
router.post('/6.getMAPlan', function (req, res, next) {
  matask06.post_getMAPlan(req, res);
});
router.post('/6.loadDetail', function (req, res, next) {
  matask06.post_loadDetail(req, res);
});
router.post('/6.delTask', function (req, res, next) {
  matask06.post_delTask(req, res);
});
router.post('/6.uptTask', function (req, res, next) {
  matask06.post_uptTask(req, res);
});
router.post('/6.search', function (req, res, next) {
  matask06.post_search(req, res);
});
//#endregion
module.exports = router;
