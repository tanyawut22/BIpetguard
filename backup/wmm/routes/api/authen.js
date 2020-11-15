var mongojs = require('mongojs');
var url = 'mongodb://localhost:27017/dpfbbn';
var db = mongojs(url, ['users']);
var request = require('request');

var express = require('express');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var secretKey = '6LfFp1MUAAAAAFAp1S65Rl2XB6og8gzomsbGN1cQ';

var get_verify_msg = function () {
    return { success: false, message: '', token: '' };
}

var verify = function (iusername, password, msg, gCCobj, onSuccess, onFailure) {
    db.users.findOne({ 'username': iusername },
        function (err, user) {
            if (typeof err !== 'undefined' && err || user == null) {
                msg.success = false;
                msg.message = 'Incorrect username or password!';
                msg.token = '';
                onFailure(msg);
            }
            else {
                if (user.password != password) {
                    msg.success = false;
                    msg.message = 'Incorrect username or password!';
                    msg.token = '';
                    onFailure(msg);
                }
                else {
                    if (gCCobj.key === undefined || gCCobj.key === '' || gCCobj.key === null) {
                        msg.success = false;
                        msg.message = 'Please select captcha';
                        msg.token = '';
                        onFailure(msg);
                    } else {
                        var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretKey + '&response=' + gCCobj.key + '&remoteip=' + gCCobj.ip;
                        request(verificationUrl, function (error, response, body) {
                            body = JSON.parse(body);
                            // console.log(body);
                            if (body.success !== undefined && !body.success) {
                                // return res.json({ 'responseCode': 1, 'responseDesc': 'Failed captcha verification' });
                                msg.success = false;
                                msg.message = 'Failed captcha verification';
                                msg.token = '';
                                onFailure(msg);
                            }
                            // res.json({ 'responseCode': 0, 'responseDesc': 'Sucess' });
                            var token = jwt.sign({ 'user': iusername }, iusername + 'dpfbbn', { expiresIn: 86400 });
                            msg.success = true;
                            msg.message = 'Authentication verified for ' + user.username;
                            msg.token = token;
                            onSuccess(msg);
                        });
                    }
                }
            }
        }
    );
}

var verifyLite = function (iusername, msg, onSuccess, onFailure) {
    db.users.findOne({ 'username': iusername },
        function (err, user) {
            if (typeof err !== 'undefined' && err || user == null) {
                msg.success = false;
                msg.message = 'Invalid username';
                msg.token = '';
                onFailure(msg);
            }
            else {
                var token = jwt.sign({ 'user': iusername }, iusername + 'dpfbbn', { expiresIn: 86400 });

                msg.success = true;
                msg.message = 'Authentication verified for ' + user.username;
                msg.token = token;
                onSuccess(msg);
            }
        }
    );
}

var check_authentication = function (req, res, next, msg, onCompleted) {
    var token = req.cookies.token;
    var name = req.cookies.username;

    if (req.cookies.signed) {
        jwt.verify(token, name + 'dpfbbn', function (err, decoded) {
            if (typeof err !== 'undefined' && err) {
                msg.success = false;
                msg.message = 'Failed to authenticate token.';
                msg.token = '';
                onCompleted(req, res, next, msg);
            }
            else {
                msg.success = true;
                msg.message = 'Success';
                msg.token = token;
                req.decoded = decoded;
                onCompleted(req, res, next, msg);
            }
        });
    }
    else {
        msg.success = false;
        msg.message = 'No token provided.';
        msg.token = '';
        onCompleted(req, res, next, msg);
    }
}

var require_authentication = function (req, res, next) {
    var msg = get_verify_msg();

    var onCompleted = function (req, res, next, msg) {
        // console.log(msg);
        if (msg.success) {
            next();
        }
        else {
            res.redirect('../');
            // res.statusCode = 302;
            // res.setHeader('Location', '../');
            // res.end();
        }
    };

    check_authentication(req, res, next, msg, onCompleted);
}

module.exports = {
    get_verify_msg,
    verify,
    verifyLite,
    check_authentication,
    require_authentication
}