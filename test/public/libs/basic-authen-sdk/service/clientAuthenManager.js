var AppAuthenResponseV1 = require('../models/appAuthenResponseV1');
var AppAuthenResponseV2 = require('../models/appAuthenResponseV2');
var CommonResponse = require('../models/common/commonResponse');
var ClientAuthenBusinessLogic = require('./business/clientAuthenBusinessLogic');
var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var ServerAuthenSecurity = require('../security/serverAuthenSecurity');
var ClientAuthenMockupManager = require('./mockup/clientAuthenMockupManager');
var ClientAuthenValidation = require('../validation/clientAuthenValidation');

var fs = require('fs');

class clientAuthenManager{
	appAuthen(req,res,_clientCallBack){
		var _authenResponse = {};
		var _clientAuthenManager;
		try{
			req.body = ClientAuthenValidation.validationRequestParametersToJson(req.body);
			if(!global.clientConfigParameter.partnerIdentities.hasOwnProperty(req.body.clientId)){
				throw new ServerAuthenErrorMessage(90002, 'clientId is invalid');
			}
			// check version
			if(req.body.ol4===null || req.body.ol4===undefined){
				// check live or mockup version
				if(global.clientConfigParameter.partnerIdentities[req.body.clientId].liveKey.trim()==''){
					_clientAuthenManager = new ClientAuthenMockupManager();
					_clientAuthenManager.appAuthenV1(res,function(_apiResponse)
					{
						_clientCallBack(_apiResponse);
					});
				}else{
					_clientAuthenManager = new ClientAuthenBusinessLogic();
					_clientAuthenManager.appAuthenV1(req,res,function(_apiResponse){
						_clientCallBack(_apiResponse);
					});
				}
			}else{
				// check live or mockup version
				if(global.clientConfigParameter.partnerIdentities[req.body.clientId].liveKey.trim()==''){
					_clientAuthenManager = new ClientAuthenMockupManager();
					_clientAuthenManager.appAuthenV2(res,function(_apiResponse)
					{
						_clientCallBack(_apiResponse);
					});
				}else{
					_clientAuthenManager = new ClientAuthenBusinessLogic();
					_clientAuthenManager.appAuthenV2(req,res,function(_apiResponse){
						_clientCallBack(_apiResponse);
					});
				}
			}
		}catch (err){
			_authenResponse = new CommonResponse(err);
			_clientCallBack(_authenResponse);
		}
	}
}

module.exports = clientAuthenManager;
