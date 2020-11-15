var mongojs = require('mongojs');
var url = "mongodb://localhost:27017/dpfbbn";
var db = mongojs(url, []);

var moment = require('moment');
var async = require('async');
var request = require('request');

const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {J6f7bKuQ3DXdLpVABurqPK5a+gfkKzBnnaR3/JLTeA2+ykrFY9mlrSiASfr8t6QGtaGyPpYi1qetBs69pMleOxq6VFm0lNEBCDvA1UQxCWrq2oTnvLDuowEf+IxexaU2+jKDt+TbV1pf7BUg3i/OTAdB04t89/1O/w1cDnyilFU=}'
}

function bot_reply(reply_token, msg) {
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'text',
                text: msg
            }]
        })
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}

function bot_push(dest, msg) {
    request.post({
        url: 'https://api.line.me/v2/bot/message/push',
        headers: LINE_HEADER,
        body: JSON.stringify({
            to: dest,
            messages: [{
                type: `text`,
                text: msg
            }]
        })
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });
}


module.exports = {
    bot_push,
    bot_reply
}