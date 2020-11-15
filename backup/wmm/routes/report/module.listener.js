var mongojs = require('mongojs');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// var creds = require('/www/app/routes/report/credentials.json');
var ses = require('/www/app/routes/api/ses.js');

var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, ['stat']);

var moment = require('moment');
var async = require('async');

var fbb_clearStatMA = function () {
    console.log('CLEAR STAT COUNTER');
    db.stat.update(
        { "level1": "matask", "level2": 0 },
        { $set: { "val": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } },
        function (err, result) {
            console.log(result);
        }
    );
}

var fbb_logZero = function () {
    var inxd = moment().date() - 1;
    console.log('CLEAR STAT LOGTEXT NOTTERMINATE COUNTER');
    async.eachSeries(['cmi', 'cri', 'plk', 'kpt', 'nsn'], function (prv, callback) {

        var txtlevel2 = moment().format('MMYYYY') + '_' + prv;

        db.stat.find({ "level1": "logTxtNotTer", "level2": txtlevel2 }, function (err, result) {
            console.log('RESULT == : ' + result.length);
            if (result.length > 0) {
                if (result[0].val[inxd] != null) {
                    console.log(result[0].val[inxd]);
                    console.log('ในวันนั้นมี data เตรียมรอ update อยู่แล้ว');
                    callback();
                } else {
                    console.log('ไม่มี data ในวันนั้นให้ update');
                    result[0].val[inxd] = '';
                    db.stat.update({ '_id': mongojs.ObjectId(result[0]._id) }, { $set: { 'val': result[0].val } }, function (errUpt, resUpt) {
                        console.log(errUpt);
                        console.log(resUpt);
                        console.log('UPDATE ' + result[0]);
                        callback();
                    });
                }
            } else {
                var tmpArr = [];
                tmpArr[inxd] = '';
                var tmp = { 'level1': 'logTxtNotTer', 'level2': txtlevel2, val: tmpArr };
                db.stat.insert(tmp, function (errAdd) {
                    callback();
                });
            }
        });
    }, function (errAsync) {
        console.log(errAsync);
    });
}

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    oAuth2Client.getToken('4/6gBCAB2iSLFF_oCEV-ZdZCriY1DOkJwylUGNLR6iHZ0WkN2CQYC5c1I', (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        console.log(JSON.stringify(token));
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
    });

}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = '/www/app/routes/report/token.json';
var fbb_gg_approve500m = function () {
    fs.readFile('/www/app/routes/report/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listMajors);
    });

    function listMajors(auth) {
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: '1oPBAT7bg4G-VVmNT-NJYHeI_DOKmHyT9-1eWo7H286c',
            range: 'Form Responses 1!A:I',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                var str = '<html><body><h3>เรียน พี่เอ็กซ์</h3><p>จัดส่งรายชื่อ non ที่ระยะสายเกิน 500 m ครับ</p><table align="left" border="1" cellpadding="1" cellspacing="1"><tr><thead><th>Internet ID</th><th>ชื่อ - สกุล ของลูกค้า</th><th>วันที่ขออนุมัติ / ติดตั้ง</th><th>ระยะสายที่ใช้ (เมตร)</th><th>เหตุผลที่ reject</th><th>ผู้อนุมัติ</th><th>remark</th></tr></thead><tbody>';
                var cRow = 0;
                for (let k = 1; k <= 7; k++) {
                    var txtToday = moment().subtract(k, 'days').format("M/D/YYYY");
                    rows.map((row) => {
                        if (!str.includes(row[1])) {
                            if (row[0].includes(txtToday)) {
                                cRow++;
                                // console.log(`${row[1]} | ${row[2]} | ${row[3]} | ${row[5]} | ${row[6]} | ${row[7]} | ${row[8]}`);
                                str += '<tr><td>' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + '</td><td>' + row[5] + '</td><td>' + row[6] + '</td><td>' + row[7] + '</td><td>' + (typeof row[8] == 'undefined' ? '' : row[8]) + '</td></tr>'
                            }
                        }
                    });
                }
                str += '</tbody></table></body></html>';
                var subject = "จัดส่ง non ที่มีการติดตั้งเนื่องจากระยะสายเกิน 500 m ประจำวันที่ " + moment().subtract(7, 'days').format("DD") + " - " + moment().subtract(1, 'days').format("DD / MM / YYYY") + " จำนวน " + cRow + " ราย";

                // console.log(subject);
                // console.log(str);
                // ses.fnc_sendingEmail(str, subject, ["burawitp@ais.co.th"]);
                ses.fnc_sendingEmail(str, subject, ["dp-fen-n@ais.co.th"]);
            } else {
                console.log('No data found.');
            }
        });
    }
}

var fbb_gg_oncall = function (plusd, onCompleted) {
    fs.readFile('/www/app/routes/report/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listOncall);
    });
    var mm = moment().add(plusd, 'd');

    var dttxt = mm.format("dddd Do MMMM YYYY");
    function listOncall(auth) {
        const sheets = google.sheets({ version: 'v4', auth });
        const mmoncall = mm.format("MMM");
        sheets.spreadsheets.values.get({
            spreadsheetId: '1Lo8p9xGU4mKpjvJKFTa5CtDOahHcCzZE93VQyW8tMV8',
            range: mmoncall + '!B1:H26',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            const txtDay = mm.format("D");
            for (var i = 0; i < 5; i++) {
                var rowi = (1) + (5 * i);
                var row = rows[rowi];
                for (var j = 0; j < 7; j++) {
                    if (row[j] == txtDay) {
                        onCompleted({ oncall: [rows[rowi + 2][j], rows[rowi + 3][j]], assigner: [rows[rowi + 4][j]], dttxt: dttxt });
                    }
                }
            }
        });
    }
}

module.exports = {
    fbb_clearStatMA,
    fbb_gg_approve500m,
    fbb_gg_oncall,
    fbb_logZero,
}