var express = require('express');
//var authen = require('./api/authen');
var request = require('request');

var router = express.Router();

router.get('/', function (req, res, next) {
    //var msglocal = authen.get_verify_msg();
    
    /* res.statusCode = 302;
    res.setHeader("Location", "table");
    res.end(); */
    //res.redirect('/table');
    console.log("Get Method");
});

router.post('/', function (req, res, next) {
    var usr = req.body.username;
    var pwd = req.body.password;
    console.log(usr+"--"+pwd);
    console.log("Post Method");
    res.redirect('/table');
    /* res.statusCode = 302;
    res.setHeader("Locaion", "/table"); 
    res.end(); */

   /*  var msglocal = authen.get_verify_msg();
    var gCaptcharobj = { 'key': req.body['g-recaptcha-response'], 'ip': req.connection.remoteAddress };
    // console.log(gCaptcharobj);

    var onSuccess = function (result) {
        res.cookie('username', usr, { httpOnly: true, secure: false, expire: new Date() + 4320000 });
        res.cookie('token', result.token, { httpOnly: true, secure: false, expire: new Date() + 4320000 });
        res.cookie('signed', true);

        res.statusCode = 302;
        res.setHeader("Location", "/matask");
        res.end();
    }

    var onFailure = function (result) {
        res.statusCode = 302;
        res.setHeader("Location", "../");
        res.end();
    } 

    if (!res.cookie.signed) {
        authen.verify(usr, pwd, msglocal, gCaptcharobj, onSuccess, onFailure);
    } else {
        res.statusCode = 302;
        res.setHeader("Locaion", "/table");
        res.end();
    } */
});

module.exports = router;