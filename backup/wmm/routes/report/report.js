var express = require('express');
var report01 = require('./report01');
var report02 = require('./report02');

var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('report/report01', { title: 'report page 1' });
});
router.post('/1.getDailyMA', function (req, res, next) {
    report01.post_getDailyStat_MA(req, res);
});
router.post('/1.getDailyMAperPrv', function (req, res, next) {
    report01.post_getDailyStat_MAbyPrv(req, res);
});
router.post('/1.getJSONperMonth', function (req, res, next) {
    report01.post_getJSONperMonth(req, res);
});
router.post('/1.getJSONperRange', function (req, res, next) {
    report01.post_getJSONperRange(req, res);
});

// ==============================================================

router.get('/2', function (req, res, next) {
    res.render('report/report02', { title: 'report page 2' });
});
router.post('/2.getDailyTerminate', function (req, res, next) {
    report02.post_getDailyTerminate(req, res);
});
router.post('/2.getDailyNotTerminate', function (req, res, next) {
    report02.post_getDailyNotTerminate(req, res);
});

// ==============================================================

router.get('/', function (req, res, next) {
    res.render('report/report03', { title: 'report page 1' });
});
router.post('/1.getDailyMA', function (req, res, next) {
    report01.post_getDailyStat_MA(req, res);
});


module.exports = router;