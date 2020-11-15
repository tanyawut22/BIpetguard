var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var reportApi = require('../report/module.api');
var reportListener = require('../report/module.listener');
const botApi = require('../bot/module.api');

var router = express.Router();
var reg_terminate = /.*(ติดตั้งได้\.|ติดตั้งเลย\.).*/i;
var reg_notter = /.*ไม่มี\..*/i;
var subregc1 = /.*(ไม่ตรงระบบ|หน้างานไม่ตรงกับระบบ).*/i;
var subregc2 = /.*(ไม่มี label|ไม่มี\.label|ไม่มี\.ลาเบล).*/i;
var subregc3 = /.*ลูกค้า renew.*/i;
var reg_apprv = /.*approve non:(\d+) dist:(\d+).*/i;
var reg_oncall = /.*oncall\+([0-9]*).*/i;

router.post('', function (req, res, next) {
    // console.log('\n======= receive post method =======');

    var reply_token_tmp = req.body.events[0].replyToken;
    // console.log(req.body.events[0]);

    // console.log('=============== END ===============\n');

    var sourceObj = req.body.events[0].source;
    var msgObj = req.body.events[0].message;
    var flagAdd = reg_terminate.test(msgObj.text);
    var flagNotAdd = reg_notter.test(msgObj.text);

    if (sourceObj.groupId != null && msgObj.text != null && flagAdd) {
        reportApi.fbb_logStatTerminate('terminate', sourceObj.groupId, 1, function (result) { });
    } else if (sourceObj.groupId != null && msgObj.text != null && flagNotAdd) {
        reportApi.fbb_logStatTerminate('notterminate', sourceObj.groupId, 1, function (result) {
            reportApi.fbb_logReasonNotTerminate(msgObj.text, sourceObj.groupId, function (rescau) {
                console.log('เก็บค่าแล้วว่าทำไมถึงถอดไม่ได้');
            });

            var f1 = subregc1.test(msgObj.text);
            var f2 = subregc2.test(msgObj.text);
            var f3 = subregc3.test(msgObj.text);

            if (f1) {
                reportApi.fbb_logSubCauseTerminate('cause_terminate', sourceObj.groupId, 0, 1, function (rescau) {
                    console.log('=== bot === ถอดไม่ได้กรณีที่ 1' + rescau);
                });
            } else if (f2) {
                reportApi.fbb_logSubCauseTerminate('cause_terminate', sourceObj.groupId, 1, 1, function (rescau) {
                    console.log('=== bot === ถอดไม่ได้กรณีที่ 2' + rescau);
                });
            } else if (f3) {
                reportApi.fbb_logSubCauseTerminate('cause_terminate', sourceObj.groupId, 2, 1, function (rescau) {
                    console.log('=== bot === ถอดไม่ได้กรณีที่ 3' + rescau);
                });
            }
        });
    } else if (sourceObj.groupId != null && sourceObj.groupId == 'Cd235fd67019052c2d94d64f9849850bf' && (msgObj.text.indexOf('oncall') != -1)) {
        var preword = "";
        var m_oncal = reg_oncall.exec(msgObj.text);
        var plusd = 0;
        if (m_oncal !== null) {
            if (m_oncal.index === reg_oncall.lastIndex) {
                reg_oncall.lastIndex++;
            }
            console.log(m_oncal);
            plusd = parseInt(m_oncal[1]);
            preword = "วันที่ ";
        } else {
            plusd = 0;
            preword = "วันนี้";
        }
        // var plusd = (msgObj.text == 'oncall+') ? 1 : 0;
        reportListener.fbb_gg_oncall(plusd, function (result) {
            // console.log(result);
            // var preword = (msgObj.text == 'oncall+') ? "พรุ่งนี้" : "วันนี้";
            if (plusd == 0) {
                result.dttxt = "";
            }
            var str = 'คนที่ทำหน้าที่ oncall ' + preword + '' + result.dttxt + '\n' + result.oncall[0] + ', ' + result.oncall[1] + '\nคนที่ทำหน้าที่ assigner\n' + result.assigner[0];
            console.log(str);
            botApi.bot_reply(reply_token_tmp, str);
        });
    } else if (sourceObj.groupId != null && sourceObj.groupId == 'Cf6f34f77d424ae287847a2afc4b722bd' && (msgObj.text.indexOf('test') != -1)) {
        console.log("==========\r\n");
        console.log(sourceObj);
        console.log("==========\r\n");
    }
    res.sendStatus(200);
});

module.exports = router;