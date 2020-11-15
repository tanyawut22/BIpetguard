var ServerAuthenSecurity = require('../../security/serverAuthenSecurity');
var ServerAuthenErrorMessage = require('../../exceptions/serverAuthenException');
var ClientAuthenValidation = require('../../validation/clientAuthenValidation');
var ClientAuthenAPIManager = require('../api/clientAuthenAPIManager');
var fs = require('fs');

var _authenResponse = {};

var Singleton = (function () {
	var instance;	
	 
	function createInstance() {
		var object = new ClientAuthenAPIManager();
		return object;
	}
	 
	return {
		getServerAuthenAPIInstance: function () {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})();

class clientAuthenBusinessLogic{
	appAuthenV1(req,res,_clientCallBack){
		var _fieldlistBody = ['authCode','clientId','redirectURL'];
		ClientAuthenValidation.validationRequestParameters(req.body,_fieldlistBody);
		var _fieldlistHeader = ['cookie','x-session-id','x-app','x-user-id'];
		ClientAuthenValidation.validationRequestParameters(req.headers,_fieldlistHeader);
		var _genLiveKey = ServerAuthenSecurity.genLiveKeyHash256(req.body.clientId,global.clientConfigParameter.partnerIdentities[req.body.clientId].email);
		if(_genLiveKey==global.clientConfigParameter.partnerIdentities[req.body.clientId].liveKey){
			var _apiParameters = {};
			var _day = new Date();
			_apiParameters.grantType = 'authorization_code';
			_apiParameters.timeStamp = _day.getTime();
			_apiParameters.authCode = req.body.authCode;
			_apiParameters.clientId = req.body.clientId;
			_apiParameters.redirectURL = req.body.redirectURL;
			if(req.body.commandId===null||req.body.commandId===undefined){req.body.commandId = null;}
			_apiParameters.commandId = req.body.commandId;
			if(!fs.existsSync(global.clientConfigParameter.partnerIdentities[req.body.clientId].secretPath)){
                throw new ServerAuthenErrorMessage(90002,'[Hummus] Secret path file not found');
			}
			var _publicKey = fs.readFileSync(global.clientConfigParameter.partnerIdentities[req.body.clientId].secretPath);
			var _txtSignature = _apiParameters.grantType+_apiParameters.authCode+_apiParameters.redirectURL+_apiParameters.clientId+_apiParameters.timeStamp;
			_apiParameters.signature = ServerAuthenSecurity.genSignatureSha256(_publicKey,_txtSignature);
			_apiParameters.headers = req.headers;
			var _clientAuthenAPIManager = Singleton.getServerAuthenAPIInstance();
			_clientAuthenAPIManager.obtainAuthorityListV1(_apiParameters,res,function(_authenCallBack){
				_clientCallBack(_authenCallBack);
			});
		}else{
			throw new ServerAuthenErrorMessage(90002,'[Hummus] LiveKey not match');
		}
	}
	appAuthenV2(req,res,_clientCallBack){
		var _fieldlistBody = ['xApp','authCode','clientId','redirectURL','ol4','privateId'];
		ClientAuthenValidation.validationRequestParameters(req.body,_fieldlistBody);
		var _genLiveKey = ServerAuthenSecurity.genLiveKeyHash256(req.body.clientId,global.clientConfigParameter.partnerIdentities[req.body.clientId].email);
		if(_genLiveKey==global.clientConfigParameter.partnerIdentities[req.body.clientId].liveKey){
			var _apiParameters = {};
			var _day = new Date();
			_apiParameters.grantType = 'authorization_code';
			_apiParameters.timeStamp = _day.getTime();
			_apiParameters.authCode = req.body.authCode;
			_apiParameters.clientId = req.body.clientId;
			_apiParameters.redirectURL = req.body.redirectURL;
			_apiParameters.ol4 = req.body.ol4;
			_apiParameters.privateId = req.body.privateId;
			if(!fs.existsSync(global.clientConfigParameter.partnerIdentities[req.body.clientId].secretPath)){
                throw new ServerAuthenErrorMessage(90002,'[Hummus] Secret path file not found');
			}
			var _publicKey = fs.readFileSync(global.clientConfigParameter.partnerIdentities[req.body.clientId].secretPath);
			var _txtSignature = _apiParameters.grantType+_apiParameters.authCode+_apiParameters.redirectURL+_apiParameters.clientId+_apiParameters.timeStamp+_apiParameters.privateId;
			_apiParameters.signature = ServerAuthenSecurity.genSignatureSha256(_publicKey,_txtSignature);
			var _clientAuthenAPIManager = Singleton.getServerAuthenAPIInstance();
			_clientAuthenAPIManager.obtainAuthorityListV2(_apiParameters,res,function(_authenCallBack){
				_clientCallBack(_authenCallBack);
			});
		}else{
			throw new ServerAuthenErrorMessage(90002,'[Hummus] LiveKey not match');
		}
	}
}

module.exports = clientAuthenBusinessLogic;
