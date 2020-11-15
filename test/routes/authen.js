var app = require('express')();
var bodyParser = require('body-parser');
var serverAuthenService = require('../libs/basic-authen-sdk');
var port = 8090;
var partnerConfig = '../app/path/path/ServerAuthenticationFile.txt';
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({type: '*/*'}));
const _serverAuthenService = new serverAuthenService();
const _builderServerAuthen = _serverAuthenService.buildServerAuthen(cfg.partnerConfig);
app.post ("/login",function(req,res){
try{
_builderServerAuthen.login(function(loginResponse)
{
res.send(loginResponse);
});
}catch (err){
res.send('');
}
});
app.listen(port);