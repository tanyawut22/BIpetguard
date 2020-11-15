var express = require('express');
var router = express.Router();

var reportApi = require('../report/module.listener');
var botApi = require('../bot/module.api');


router.get('/', function (req, res, next) {
    res.send(401, 'Not Allow');
});

router.get('/00test', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  TEST : ' + ip);
        res.end();
    } else {
        res.end();
    }
});

router.get('/01min', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  01 min : ' + ip);
        res.end();
    } else {
        res.end();
    }
});

router.get('/05min', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  05 min : ' + ip);
        res.end();
    } else {
        res.end();
    }
});

router.get('/at08am', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  at 08:00 am every day : ' + ip);
        reportApi.fbb_gg_oncall(0, function (result) {
            var str = 'วันนี้คนที่ทำหน้าที่ oncall\n' + result.oncall[0] + ', ' + result.oncall[1] + '\nคนที่ทำหน้าที่ assigner\n' + result.assigner[0];
            botApi.bot_push('Cd235fd67019052c2d94d64f9849850bf', str);

            var strmkt = 'วันนี้คนที่ทำหน้าที่ support งาน Installation\n' + result.oncall[0] + ', ' + result.oncall[1] + '\nคนที่ทำหน้าที่ support งาน MA\n' + result.assigner[0];
            botApi.bot_push('Cf6f34f77d424ae287847a2afc4b722bd', strmkt);
        });
        res.end();
    } else {
        res.end();
    }
});


router.get('/at08hr', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  at 08:00 am every monday : ' + ip);
        reportApi.fbb_gg_approve500m();
        res.end();
    } else {
        res.end();
    }
});

router.get('/01day', function (req, res, next) {
    var ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip == "::ffff:127.0.0.1") {
        console.log('==>>  01 day : ' + ip);
        reportApi.fbb_clearStatMA();
        reportApi.fbb_logZero();
        res.end();
    } else {
        res.end();
    }
});

module.exports = router;