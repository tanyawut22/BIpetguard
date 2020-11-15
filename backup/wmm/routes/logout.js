var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.clearCookie('token');
    res.clearCookie('username');
    res.clearCookie('signed');

    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
});

module.exports = router;