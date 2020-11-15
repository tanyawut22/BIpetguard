var express = require('express');

var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('uilib/uilib01', { title: 'uilib page 1' });
});

router.get('/2', function (req, res, next) {
    res.render('uilib/uilib02', { title: 'uilib page 1' });
});

module.exports = router;
