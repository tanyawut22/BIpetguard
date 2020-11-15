var LoginResponse = require('../models/loginResponse');
var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var ServerAuthenSecurity = require('../security/serverAuthenSecurity');
var ServerAuthenAPIManager = require('./api/serverAuthenAPIManager');
var ServerAuthenUtility = require('../utility/serverAuthenUtility');

var fs = require('fs');

var Singleton = (function () {
	var instance;	
	 
	function createInstance() {
		var object = new ServerAuthenAPIManager();
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

class serverAuthenManager {
	login(_clientCallback){
		var _loginResponse = {};
		try{
			var _genLiveKey = ServerAuthenSecurity.genLiveKeyHash256(global.configParameter.clientId,global.configParameter.email);
			if(global.configParameter.liveKey==_genLiveKey){
				var _apiParameter = {};
				var _d = new Date(), _milliseconds = _d.getTime();

				_apiParameter.timeStamp = _milliseconds;
				_apiParameter.servierId = global.configParameter.email;
				if(!fs.existsSync(global.configParameter.secretKeyPath)){
					throw new ServerAuthenErrorMessage(90002,'[Hummus] Secret path file not found');
				}
				var _publicKey = fs.readFileSync(global.configParameter.secretKeyPath);
				var _txtSingnature = global.configParameter.clientId+_apiParameter.timeStamp+_apiParameter.servierId;
				_apiParameter.signature = ServerAuthenSecurity.genSignatureSha256(_publicKey,_txtSingnature);
				var _serverAuthenAPIManager = Singleton.getServerAuthenAPIInstance();
				_serverAuthenAPIManager.loginB2B(_apiParameter, function(apiResponse)
					{
						_loginResponse = new LoginResponse(apiResponse);
						_clientCallback(_loginResponse);
					});
			}else{
				throw new ServerAuthenErrorMessage(90002,'[Hummus] LiveKey not match');
			}	
		}catch (err){
			var fieldlist = ["expireIn","headers"];
			_loginResponse = new LoginResponse(err);
			_loginResponse = ServerAuthenUtility.backendResponseParse(_loginResponse,fieldlist);
			_clientCallback(_loginResponse);
		}
	}
}

module.exports = serverAuthenManager
