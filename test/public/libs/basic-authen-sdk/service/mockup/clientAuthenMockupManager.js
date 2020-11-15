var AppAuthenResponseV1 = require('../../models/appAuthenResponseV1');
var AppAuthenResponseV2 = require('../../models/appAuthenResponseV2');
var CommonResponse = require('../../models/common/commonResponse');

var _apiResponse = {};
var _authenResponse = {};

class clientAuthenMockupManager{
	appAuthenV1 (res,_clientCallBack){
		// Header
		res.set('Set-Cookie', "site=CWT1; node=101");
		res.set('x-access-token', "eifu11EKDFGT1313");
		res.set('x-app', "Site=CWT1; node=101; partnerId=20001; ptsAppKeyName=Cookierun|Android|1.0.0");
		res.set('x-orderRef', "201806130924141234");
		res.set('x-private-id', "o0Tq5hqVnvO502OXve");
		res.set('x-session-id', "ojgojfo;djsajfdjs");
		res.set('x-user-id', "Y9sa2@nvlsowhkd");
		// body
		_apiResponse.resultCode = '20000';
		_apiResponse.developerMessage = 'Success (Mockup)';
		_apiResponse.userMessage = null;
		_apiResponse.moreInfo = 'http://smaf.pantry.ais/20000';
		_apiResponse.accessToken = 'eifu11EKDFGT1313';
		_apiResponse.expireIn = '3600';
		_apiResponse.idType = 'E.164';
		_apiResponse.idValue = '66811234567';
		_apiResponse.gupAuthenLevel = 'gupAuthenLevel';
		_apiResponse.ptsListOfAPI = ["loanPotential|C:password,R:no,U:password,D:0,L:token|no","Push Notification|C:password,R:no,U:password,D:no,L:token|yes"];
		_apiResponse.gupRegistrationLevel = 'password';
		_apiResponse.openIdFlag = true;
		_apiResponse.ptsAppId = '400200020001000';
		_apiResponse.ptsAppEnvironmentType = 'production';
		_authenResponse = new AppAuthenResponseV1(_apiResponse);
		_clientCallBack(_authenResponse);
	}
	appAuthenV2 (res,_clientCallBack){
		// Header
		res.set('x-app', "Site=CWT1; node=101; partnerId=20001; ptsAppKeyName=Cookierun|Android|1.0.0");
		res.set('x-orderRef', "201806130924141234");
		res.set('x-session-id', "ojgojfo;djsajfdjs");
		// body
		_apiResponse.resultCode = '20000';
		_apiResponse.developerMessage = 'Success (Mockup)';
		_apiResponse.userMessage = null;
		_apiResponse.moreInfo = 'http://smaf.pantry.ais/20000';
		_apiResponse.accessToken = 'eifu11EKDFGT1313';
		_apiResponse.expireIn = '3600';
		_apiResponse.privateId = 'o0Tq5hqVnvO502OXve';
		_apiResponse.ptsListOfAPI = ["loanPotential|C:password,R:no,U:password,D:0,L:token|no","Push Notification|C:password,R:no,U:password,D:no,L:token|yes"];
		_apiResponse.pwrtcAddress = null;
		_apiResponse.stunServer = null;
		_apiResponse.turnServer = null;
		_apiResponse.idType = 'E.164';
		_apiResponse.idValue = '66811234567';
		_apiResponse.partnerSession = null;
		_apiResponse.ptsWindowTime = null;
		_apiResponse.ol4 = null;
		_apiResponse.operatorId = "";
		_authenResponse = new AppAuthenResponseV2(_apiResponse);
		_clientCallBack(_authenResponse);
	}
}

module.exports = clientAuthenMockupManager;
