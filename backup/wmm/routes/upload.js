var express = require('express');
var formidable = require('formidable');
var uuid = require('uuid');
var fs = require('fs');

var router = express.Router();

var uploadImage = function (req, onCompleted) {
    var form = new formidable.IncomingForm();
    var result = { name: '' };
    form.parse(req);

    form.on('fileBegin', function (name, file) {
        var ext = '.jpg';
        if (file.name.indexOf(".jpg") > 0) {
            ext = '.jpg';
        }
        else if (file.name.indexOf('.png') > 0) {
            ext = '.png';
        }
        else {
            ext = '';
        }

        if (ext.length > 0) {
            var dir = __dirname + '/../public/files';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                fs.chmodSync(dir, 0775);
            }
            file.path = dir + '/' + uuid.v4() + ext;
            result.name = file.path;
        }
    });

    form.on('file', function (name, file) {
        fs.chmodSync(result.name, 0664);
        onCompleted(result);
    });
}

router.post('/', function (req, res, next) {
    uploadImage(req, function (result) {
        res.json({ "success": true, "name": result.name });
    });
})

module.exports = router;


