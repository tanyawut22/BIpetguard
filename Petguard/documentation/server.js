var app = require('express')();
var bodyParser = require('body-parser');
var serverAuthenService = require('../libs/basic-authen-sdk');
var port = 8090;
var partnerConfig = {
    "clientId": "zPgaUeVWeZcKDvSc2yW2JaD6IrLDg7IhI0766zM6JjXZ17x/IJQiIg==",
    "secretKeyPath": "./ais-partner_28001.crt",
    "email": "chirasat@ais.co.th",
    "liveKey": "QHsq0JgLrqJj0K+4ur1rouEvc1j8UswSOoA8URIv/To=",
    "urlLoginB2B": "https://apipg.ais.co.th:15400/v1/loginByB2B.json",
    "apiHost": ""
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: '*/*' }));
const _serverAuthenService = new serverAuthenService();
const _builderServerAuthen = _serverAuthenService.buildServerAuthen();
app.post("/login", function (req, res) {
    try {
        _builderServerAuthen.login(function (loginResponse) {
            res.send(loginResponse);
        });
    } catch (err) {
        res.send('');
    }
});
app.listen(port);
Document