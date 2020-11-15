var LoginResponse = require('../../models/loginResponse');
var ServerAuthenUtility = require('../../utility/serverAuthenUtility');
var ServerAuthenErrorMessage = require('../../exceptions/serverAuthenException');

class serverAuthenMockupManager {
	login (_clientCallback){
		var _loginResponse = {};
		var _apiResponse = {};
		_apiResponse.developerMessage =  "Success (Mockup)";
		_apiResponse.userMessage =  null;
		_apiResponse.resultCode =  "20000";
		_apiResponse.moreInfo =  null;
		_apiResponse.expireIn =  "3600"; 
		_apiResponse.headers = {
			'Set-Cookie' : 'site=CWT1;node=101',
			'x-session-id' : 'ojgojfo;djsajfdjs',
			'x-app' : 'CWT1;101;20001;Cookierun|Android|1.0.0',
			'x-user-id' : 'Y9sa2@nvlsowhkd',
			'x-access-token' : 'TXjsooq##@i0df'
		};

		_loginResponse = new LoginResponse(_apiResponse);
		_clientCallback(_loginResponse);
	}
}

module.exports = serverAuthenMockupManager;
