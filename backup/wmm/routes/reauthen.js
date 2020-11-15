var express = require('express');
var authen = require('./api/authen');
var router = express.Router();

// ==== ตรงนี้ที่นึง 
router.use(authen.require_authentication);

router.post('/', function (req, res, next) {
    var username = req.body.username || req.query.username || req.cookies.username;

    var msg = authen.get_verify_msg();

    var onSuccess = function (result) {
        res.cookie('username', username, { httpOnly: true, secure: true, expire: new Date() + 4320000 });
        res.cookie('token', result.token, { httpOnly: true, secure: true, expire: new Date() + 4320000 });

        res.json({ success: 'true' });
    };

    var onFailure = function (result) {
        res.redirect("../");
        res.json({ success: 'false' });
    };

    // ==== ตรงนี้ที่นึง 
    authen.verifyLite(username, msg, onSuccess, onFailure);
});

module.exports = router;